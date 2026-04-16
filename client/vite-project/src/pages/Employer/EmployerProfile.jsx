import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  Camera,
  User,
  Save,
  Loader2,
  Lock,
  Moon,
  Sun,
  Bell,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const InputField = ({ label, hint, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
    <input
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
        }`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextAreaField = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <textarea
      {...props}
      className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition resize-none ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
        }`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const PasswordField = ({ label, hint, error, isVisible, onToggleVisibility, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
    <div className="relative">
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={`w-full px-4 pr-11 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
          }`}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const AvatarUploader = ({ currentUrl, label, onUpload, uploading, setUploading }) => {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      setUploading(true);
      const res = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        onUpload(res.data.imageUrl);
        toast.success("Image uploaded");
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden border-2 border-blue-100">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-blue-400 text-3xl font-bold">
              {label === "Avatar" ? <User className="h-8 w-8" /> : <Building2 className="h-8 w-8" />}
            </span>
          )}
        </div>
        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          {uploading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
      <p className="text-xs text-gray-400">Click to upload {label.toLowerCase()}</p>
    </div>
  );
};

const EmployerProfile = () => {
  const { user, updateUser } = useAuth();
  const isDark = (user?.themePreference || "light") === "dark";
  const preferencesStorageKey = `employer:preferences:${String(user?.email || "anonymous").toLowerCase()}`;

  const [form, setForm] = useState({
    name: "",
    avatar: "",
    companyName: "",
    companyDescription: "",
    companyLogo: "",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    weeklyDigest: false,
    profileVisible: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        avatar: user.avatar || "",
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        companyLogo: user.companyLogo || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.REVIEWS.GET_RECEIVED);
        if (!response.data?.success) return;
        setReceivedReviews(response.data.reviews || []);
        setAverageRating(response.data.averageRating || 0);
      } catch {
        setReceivedReviews([]);
        setAverageRating(0);
      }
    };

    if (user?._id) {
      loadReviews();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?.email) return;

    try {
      const saved = localStorage.getItem(preferencesStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      setPreferences((prev) => ({ ...prev }));
    }
  }, [user?.email, preferencesStorageKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.companyName.trim()) errs.companyName = "Company name is required";
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setIsSaving(true);
      const res = await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, form);
      if (res.data?.success) {
        updateUser(res.data.user || form);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.data?.message || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeToggle = async () => {
    const nextTheme = isDark ? "light" : "dark";
    try {
      setIsSavingTheme(true);
      const response = await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, {
        themePreference: nextTheme,
      });

      if (response.data?.success) {
        updateUser({ themePreference: nextTheme });
        toast.success(`${nextTheme === "dark" ? "Dark" : "Light"} mode enabled`);
      } else {
        toast.error(response.data?.message || "Failed to update theme");
      }
    } catch {
      toast.error("Failed to update theme");
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      nextErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      return;
    }

    try {
      setIsSavingPassword(true);
      const response = await axiosInstance.put(API_PATHS.USERS.CHANGE_PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data?.success) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordErrors({});
        toast.success("Password changed successfully");
      } else {
        toast.error(response.data?.message || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handlePreferenceToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const savePreferences = async () => {
    try {
      setIsSavingPreferences(true);
      localStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout activeMenu="company-profile">
        <LoadingSpinner text="Loading profile settings..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your company information visible to job seekers
          </p>
        </div>

        <div className={`rounded-2xl border p-2 grid grid-cols-1 sm:grid-cols-3 gap-2 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
          {[
            { id: "profile", label: "Profile Settings", icon: User },
            { id: "security", label: "Security", icon: Lock },
            { id: "preferences", label: "Preferences", icon: Bell },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeSection === id
                ? isDark
                  ? "bg-blue-900/40 text-blue-200"
                  : "bg-blue-50 text-blue-700"
                : isDark
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {React.createElement(icon, { className: "h-4 w-4" })}
              {label}
            </button>
          ))}
        </div>

        {activeSection === "profile" && (
          <>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-blue-500" />
                  Profile Images
                </h2>
                <div className="flex flex-wrap gap-10 justify-center sm:justify-start">
                  <div className="flex flex-col items-center gap-2">
                    <AvatarUploader
                      currentUrl={form.avatar}
                      label="Avatar"
                      uploading={avatarUploading}
                      setUploading={setAvatarUploading}
                      onUpload={(url) => setForm((prev) => ({ ...prev, avatar: url }))}
                    />
                    <p className="text-xs text-gray-500 font-medium">Your Photo</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <AvatarUploader
                      currentUrl={form.companyLogo}
                      label="Logo"
                      uploading={logoUploading}
                      setUploading={setLogoUploading}
                      onUpload={(url) => setForm((prev) => ({ ...prev, companyLogo: url }))}
                    />
                    <p className="text-xs text-gray-500 font-medium">Company Logo</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Personal Info
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Your Name *"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder={user?.email || ""}
                    value={user?.email || ""}
                    readOnly
                    disabled
                    hint="Email cannot be changed"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Company Info
                </h2>
                <div className="space-y-4">
                  <InputField
                    label="Company Name *"
                    name="companyName"
                    placeholder="Acme Corp"
                    value={form.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                  />
                  <TextAreaField
                    label="Company Description"
                    name="companyDescription"
                    placeholder="Describe what your company does, your culture, and what you look for in candidates..."
                    rows={4}
                    value={form.companyDescription}
                    onChange={handleChange}
                    error={errors.companyDescription}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </>
        )}

        {activeSection === "security" && (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500" />
                Change Password
              </h2>
              <div className="space-y-4">
                <PasswordField
                  label="Current Password *"
                  name="currentPassword"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInput}
                  error={passwordErrors.currentPassword}
                  isVisible={showPassword.currentPassword}
                  onToggleVisibility={() => togglePasswordVisibility("currentPassword")}
                />
                <PasswordField
                  label="New Password *"
                  name="newPassword"
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInput}
                  error={passwordErrors.newPassword}
                  isVisible={showPassword.newPassword}
                  onToggleVisibility={() => togglePasswordVisibility("newPassword")}
                />
                <PasswordField
                  label="Confirm New Password *"
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInput}
                  error={passwordErrors.confirmPassword}
                  isVisible={showPassword.confirmPassword}
                  onToggleVisibility={() => togglePasswordVisibility("confirmPassword")}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm shadow-blue-200"
              >
                {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                {isSavingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}

        {activeSection === "preferences" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                {isDark ? <Moon className="h-4 w-4 text-blue-500" /> : <Sun className="h-4 w-4 text-blue-500" />}
                Appearance
              </h2>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Theme Mode</p>
                  <p className="text-xs text-gray-500 mt-1">Switch between light and dark mode.</p>
                </div>
                <button
                  type="button"
                  disabled={isSavingTheme}
                  onClick={handleThemeToggle}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {isSavingTheme ? <Loader2 className="h-4 w-4 animate-spin" /> : isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Use Light Mode" : "Use Dark Mode"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                Notification & Privacy
              </h2>

              {[
                {
                  key: "emailNotifications",
                  title: "Email notifications",
                  description: "Get important job and candidate updates by email.",
                },
                {
                  key: "inAppNotifications",
                  title: "In-app notifications",
                  description: "Show real-time alerts inside your dashboard.",
                },
                {
                  key: "weeklyDigest",
                  title: "Weekly hiring digest",
                  description: "Receive a summary of your hiring activity each week.",
                },
                {
                  key: "profileVisible",
                  title: "Public company visibility",
                  description: "Allow jobseekers to discover your company profile.",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle(item.key)}
                    className={`h-7 w-12 rounded-full p-1 transition-colors ${preferences[item.key] ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white transition-transform ${preferences[item.key] ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSavingPreferences}
                onClick={savePreferences}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm shadow-blue-200"
              >
                {isSavingPreferences ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSavingPreferences ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Company Reviews</h2>
          <p className="text-sm text-gray-500 mb-4">
            Average rating: <span className="font-semibold text-gray-800">{averageRating || 0}</span> / 5
          </p>

          {receivedReviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {receivedReviews.slice(0, 5).map((review) => (
                <div key={review._id} className="rounded-xl border border-gray-200 p-3">
                  <p className="text-sm font-medium text-gray-900">
                    {review.reviewer?.name || "Freelancer"} • {review.rating}/5
                  </p>
                  <p className="text-xs text-gray-500">{review.job?.title || "Project"}</p>
                  {review.comment ? (
                    <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfile;
