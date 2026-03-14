import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  User,
  Camera,
  FileText,
  Trash2,
  Save,
  Loader2,
  Upload,
  CheckCircle,
  Lock,
  Link as LinkIcon,
  FileBadge,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";

const InputField = ({ label, error, disabled, isDark, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>{label}</label>
    <input
      {...props}
      disabled={disabled}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition ${
        disabled
          ? isDark
            ? "border-slate-700 bg-slate-800 text-slate-400 cursor-not-allowed"
            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          : error
            ? "border-red-400 bg-red-50 text-gray-900"
            : isDark
              ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              : "border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
      }`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    avatar: "",
    resume: "",
    linkedinUrl: "",
    bio: "",
    interests: "",
    themePreference: "light",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      avatar: user.avatar || "",
      resume: user.resume || "",
      linkedinUrl: user.linkedinUrl || "",
      bio: user.bio || "",
      interests: Array.isArray(user.interests) ? user.interests.join(", ") : "",
      themePreference: user.themePreference || "light",
    });
  }, [user]);

  const isDark = form.themePreference === "dark";

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? "#0f172a" : "#f8fafc";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [isDark]);

  const cardClass = useMemo(
    () =>
      isDark
        ? "bg-slate-800 border-slate-700"
        : "bg-white border-gray-100",
    [isDark]
  );

  const textPrimary = isDark ? "text-slate-100" : "text-gray-900";
  const textSecondary = isDark ? "text-slate-300" : "text-gray-500";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const parseInterests = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarUploading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Upload failed");
        return;
      }

      setForm((prev) => ({ ...prev, avatar: response.data.imageUrl }));
      toast.success("Avatar uploaded successfully");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setResumeUploading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Upload failed");
        return;
      }

      setForm((prev) => ({ ...prev, resume: response.data.imageUrl }));
      toast.success("Resume uploaded successfully");
    } catch {
      toast.error("Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!form.resume) return;

    setDeletingResume(true);
    try {
      const response = await axiosInstance.delete(API_PATHS.USERS.DELETE_RESUME);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to delete resume");
        return;
      }

      setForm((prev) => ({ ...prev, resume: "" }));
      updateUser({ resume: "" });
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeletingResume(false);
    }
  };

  const validateProfile = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Full name is required";

    if (form.linkedinUrl && !/^https?:\/\//i.test(form.linkedinUrl)) {
      nextErrors.linkedinUrl = "LinkedIn URL should start with http:// or https://";
    }

    return nextErrors;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const nextErrors = validateProfile();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        avatar: form.avatar,
        resume: form.resume,
        linkedinUrl: form.linkedinUrl,
        bio: form.bio,
        interests: parseInterests(form.interests),
        themePreference: form.themePreference,
      };

      const response = await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, payload);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to update profile");
        return;
      }

      updateUser(response.data.user);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await axiosInstance.put(API_PATHS.USERS.CHANGE_PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to change password");
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      <FreelancerNavbar active="profile" />
      <div className={`py-12 px-4 ${isDark ? "bg-slate-950" : "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600"}`}>
        <div className="max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white">Freelancer Profile</h1>
            <p className="text-sm mt-2 text-blue-100">Update your details, resume, bio, interests and password</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className={`rounded-2xl border shadow-sm p-6 ${cardClass}`}>
            <h2 className={`font-semibold text-base mb-5 flex items-center gap-2 ${textPrimary}`}>
              <Camera className="h-4 w-4 text-blue-500" />
              Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className={`h-20 w-20 rounded-2xl flex items-center justify-center overflow-hidden border-2 ${isDark ? "bg-slate-700 border-slate-600" : "bg-blue-100 border-blue-100"}`}>
                  {form.avatar ? (
                    <img src={form.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-blue-400" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {avatarUploading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              <div>
                <p className={`font-medium ${textPrimary}`}>{user?.name}</p>
                <p className={`text-sm capitalize ${textSecondary}`}>Freelancer</p>
                <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Change photo
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border shadow-sm p-6 ${cardClass}`}>
            <h2 className={`font-semibold text-base mb-5 flex items-center gap-2 ${textPrimary}`}>
              <User className="h-4 w-4 text-blue-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Full Name *"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                isDark={isDark}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={user?.email || ""}
                disabled
                isDark={isDark}
              />
              <div className="sm:col-span-2">
                <InputField
                  label="LinkedIn URL"
                  name="linkedinUrl"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  error={errors.linkedinUrl}
                  isDark={isDark}
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>Short Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Write a short bio about your experience, skills and goals"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                      : "border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <InputField
                  label="Interests (comma separated)"
                  name="interests"
                  placeholder="Frontend Development, UI/UX, Remote Work"
                  value={form.interests}
                  onChange={handleChange}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border shadow-sm p-6 space-y-4 ${cardClass}`}>
            <h2 className={`font-semibold text-base flex items-center gap-2 ${textPrimary}`}>
              <FileText className="h-4 w-4 text-blue-500" />
              Resume
            </h2>

            {form.resume ? (
              <div className={`flex items-center gap-3 p-4 border rounded-xl ${isDark ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"}`}>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDark ? "text-green-300" : "text-green-800"}`}>Resume uploaded</p>
                  <a
                    href={form.resume}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs hover:underline truncate block ${isDark ? "text-green-400" : "text-green-700"}`}
                  >
                    {form.resume}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteResume}
                  disabled={deletingResume}
                  className="p-2 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-40"
                  title="Delete resume"
                >
                  {deletingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDark ? "border-slate-600" : "border-gray-200"}`}>
                <FileText className={`h-8 w-8 mx-auto mb-3 ${isDark ? "text-slate-400" : "text-gray-300"}`} />
                <p className={`text-sm mb-3 ${isDark ? "text-slate-300" : "text-gray-500"}`}>Upload your resume (PDF, DOC)</p>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                    {resumeUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {resumeUploading ? "Uploading..." : "Upload Resume"}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>Or paste resume link</label>
              <input
                type="url"
                name="resume"
                placeholder="https://drive.google.com/..."
                value={form.resume}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    : "border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <form onSubmit={handleChangePassword} className={`rounded-2xl border shadow-sm p-6 space-y-4 ${cardClass}`}>
          <h2 className={`font-semibold text-base flex items-center gap-2 ${textPrimary}`}>
            <Lock className="h-4 w-4 text-blue-500" />
            Change Password
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              isDark={isDark}
            />
            <InputField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              isDark={isDark}
            />
            <InputField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              isDark={isDark}
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors"
          >
            {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBadge className="h-4 w-4" />}
            {isChangingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>

        <div className={`rounded-2xl border shadow-sm p-6 ${cardClass}`}>
          <h2 className={`font-semibold text-base flex items-center gap-2 mb-3 ${textPrimary}`}>
            <LinkIcon className="h-4 w-4 text-blue-500" />
            Quick Profile Preview
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            <span className="font-semibold">LinkedIn:</span> {form.linkedinUrl || "Not added"}
          </p>
          <p className={`text-sm mt-2 ${textSecondary}`}>
            <span className="font-semibold">Interests:</span> {form.interests || "Not added"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
