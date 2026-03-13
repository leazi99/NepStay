import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Camera,
  FileText,
  Trash2,
  Save,
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";

const InputField = ({ label, error, disabled, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      disabled={disabled}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition ${disabled
          ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          : error
            ? "border-red-400 bg-red-50 text-gray-900"
            : "border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        }`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", avatar: "", resume: "" });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        avatar: user.avatar || "",
        resume: user.resume || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarUploading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setForm((prev) => ({ ...prev, avatar: res.data.imageUrl }));
        toast.success("Avatar uploaded");
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch { toast.error("Upload failed"); }
    finally { setAvatarUploading(false); }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setResumeUploading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setForm((prev) => ({ ...prev, resume: res.data.imageUrl }));
        toast.success("Resume uploaded");
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch { toast.error("Upload failed"); }
    finally { setResumeUploading(false); }
  };

  const handleDeleteResume = async () => {
    if (!form.resume) return;
    setDeletingResume(true);
    try {
      const res = await axiosInstance.delete(API_PATHS.USERS.DELETE_RESUME, {
        data: { resumeUrl: form.resume },
      });
      if (res.data) {
        setForm((prev) => ({ ...prev, resume: "" }));
        updateUser({ ...user, resume: "" });
        toast.success("Resume deleted");
      }
    } catch { toast.error("Failed to delete resume"); }
    finally { setDeletingResume(false); }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSaving(true);
    try {
      const res = await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, {
        name: form.name,
        avatar: form.avatar,
        resume: form.resume,
      });
      if (res.data) {
        updateUser({ name: form.name, avatar: form.avatar, resume: form.resume });
        toast.success("Profile updated!");
      }
    } catch { toast.error("Failed to update profile"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-blue-100 text-sm mt-2">Manage your personal information and resume</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 text-base mb-5 flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" />
              Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden border-2 border-blue-100">
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
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Change photo
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 text-base mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Full Name *"
                name="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder={user?.email || ""}
                value={user?.email || ""}
                disabled
              />
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Resume
            </h2>

            {form.resume ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">Resume uploaded</p>
                  <a
                    href={form.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-green-700 hover:underline truncate block"
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
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">Upload your resume (PDF, DOC)</p>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                    {resumeUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {resumeUploading ? "Uploading..." : "Upload Resume"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 mb-2">Or paste a resume link</p>
              <input
                type="url"
                name="resume"
                placeholder="https://drive.google.com/..."
                value={form.resume}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
