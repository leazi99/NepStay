import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  Camera,
  User,
  Save,
  Loader2,
  AlertCircle,
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

const AvatarUploader = ({ currentUrl, label, onUpload, uploading }) => {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
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
  const [errors, setErrors] = useState({});

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
      if (res.data) {
        updateUser(form);
        toast.success("Profile updated successfully!");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your company information visible to job seekers
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatars */}
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
                  onUpload={(url) => setForm((prev) => ({ ...prev, avatar: url }))}
                />
                <p className="text-xs text-gray-500 font-medium">Your Photo</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarUploader
                  currentUrl={form.companyLogo}
                  label="Logo"
                  uploading={logoUploading}
                  onUpload={(url) => setForm((prev) => ({ ...prev, companyLogo: url }))}
                />
                <p className="text-xs text-gray-500 font-medium">Company Logo</p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
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

          {/* Company Info */}
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

          {/* Save */}
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
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfile;
