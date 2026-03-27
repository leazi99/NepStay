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
  Star,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";

const EDUCATION_LEVELS = [
  "SEE/SLC",
  "+2 / Higher Secondary",
  "Bachelor's Degree",
  "Master's Degree",
  "Diploma / Certificate",
  "Other",
];

const SPECIALIZATIONS = {
  "SEE/SLC": ["General"],
  "+2 / Higher Secondary": ["Science", "Management", "Humanities", "Education", "Other"],
  "Bachelor's Degree": [
    "Computer Science / IT",
    "Business / Management",
    "Engineering",
    "Design / Creative",
    "Health / Medical",
    "Other",
  ],
  "Master's Degree": [
    "Computer Science / IT",
    "Business / Management",
    "Engineering",
    "Data Science / AI",
    "Public Policy / Social",
    "Other",
  ],
  "Diploma / Certificate": ["Technical", "Language", "Design", "Business", "Other"],
  Other: ["Other"],
};

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
    studentIdCard: "",
    nationalIdCard: "",
    identityVerificationStatus: "not_submitted",
    latestEducation: "",
    specialization: "",
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
  const [studentIdUploading, setStudentIdUploading] = useState(false);
  const [nationalIdUploading, setNationalIdUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [eligibleReviews, setEligibleReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [submittingReviewPaymentId, setSubmittingReviewPaymentId] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const showFeedbackAndRatings = false;

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      avatar: user.avatar || "",
      resume: user.resume || "",
      studentIdCard: user.studentIdCard || "",
      nationalIdCard: user.nationalIdCard || "",
      identityVerificationStatus: user.identityVerificationStatus || "not_submitted",
      latestEducation: user.latestEducation || "",
      specialization: user.specialization || "",
      linkedinUrl: user.linkedinUrl || "",
      bio: user.bio || "",
      interests: Array.isArray(user.interests) ? user.interests.join(", ") : "",
      themePreference: user.themePreference || "light",
    });
  }, [user]);

  useEffect(() => {
    if (!showFeedbackAndRatings) {
      setEligibleReviews([]);
      setReceivedReviews([]);
      setAverageRating(0);
      return;
    }

    const loadReviewData = async () => {
      if (!user?._id) return;

      try {
        const [eligibleRes, receivedRes] = await Promise.all([
          axiosInstance.get(API_PATHS.REVIEWS.GET_ELIGIBLE),
          axiosInstance.get(API_PATHS.REVIEWS.GET_RECEIVED),
        ]);

        if (eligibleRes.data?.success) {
          setEligibleReviews(eligibleRes.data.eligible || []);
        }

        if (receivedRes.data?.success) {
          setReceivedReviews(receivedRes.data.reviews || []);
          setAverageRating(receivedRes.data.averageRating || 0);
        }
      } catch {
        setEligibleReviews([]);
        setReceivedReviews([]);
      }
    };

    loadReviewData();
  }, [showFeedbackAndRatings, user?._id]);

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
  const specializationOptions = SPECIALIZATIONS[form.latestEducation] || [];

  const parseInterests = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const profileStatus = useMemo(() => {
    const hasName = Boolean(form.name.trim());
    const hasBio = Boolean(form.bio.trim());
    const hasInterests = parseInterests(form.interests).length > 0;
    const hasEducation = Boolean(form.latestEducation.trim());
    const hasSpecialization = Boolean(form.specialization.trim());
    const hasResume = Boolean(form.resume.trim());
    const hasLinkedin = Boolean(form.linkedinUrl.trim());
    const docsReady = Boolean(form.studentIdCard && form.nationalIdCard);

    const items = [
      { key: "personal", label: "Personal Info", completed: hasName && hasBio },
      { key: "preferences", label: "Job Preferences", completed: hasInterests && hasEducation && hasSpecialization },
      { key: "resume", label: "Resume", completed: hasResume },
      { key: "links", label: "Portfolio/LinkedIn", completed: hasLinkedin },
      { key: "verification", label: "Identity Verification", completed: docsReady },
    ];

    const completedCount = items.filter((item) => item.completed).length;
    const completion = Math.round((completedCount / items.length) * 100);

    return { items, completion };
  }, [
    form.name,
    form.bio,
    form.interests,
    form.latestEducation,
    form.specialization,
    form.resume,
    form.linkedinUrl,
    form.studentIdCard,
    form.nationalIdCard,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

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
    formData.append("resume", file);

    setResumeUploading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.UPLOAD_RESUME, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Upload failed");
        return;
      }

      setForm((prev) => ({ ...prev, resume: response.data.resumeUrl }));
      updateUser({ resume: response.data.resumeUrl });
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

  const handleVerificationDocUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    if (type === "student") setStudentIdUploading(true);
    if (type === "national") setNationalIdUploading(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.UPLOAD_VERIFICATION_DOC,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!response.data.success || !response.data.documentUrl) {
        toast.error(response.data.message || "Upload failed");
        return;
      }

      const documentUrl = response.data.documentUrl;

      setForm((prev) => {
        const next = {
          ...prev,
          studentIdCard: type === "student" ? documentUrl : prev.studentIdCard,
          nationalIdCard: type === "national" ? documentUrl : prev.nationalIdCard,
        };

        next.identityVerificationStatus =
          next.studentIdCard && next.nationalIdCard ? "pending" : "not_submitted";

        return next;
      });

      const nextStudentIdCard =
        type === "student" ? documentUrl : form.studentIdCard;
      const nextNationalIdCard =
        type === "national" ? documentUrl : form.nationalIdCard;
      const nextVerificationStatus =
        nextStudentIdCard && nextNationalIdCard ? "pending" : "not_submitted";

      updateUser({
        studentIdCard: nextStudentIdCard,
        nationalIdCard: nextNationalIdCard,
        identityVerificationStatus: nextVerificationStatus,
      });

      if (nextStudentIdCard && nextNationalIdCard) {
        const submitResponse = await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, {
          studentIdCard: nextStudentIdCard,
          nationalIdCard: nextNationalIdCard,
        });

        if (!submitResponse.data.success) {
          toast.error(
            submitResponse.data.message || "Failed to submit verification documents",
          );
          return;
        }

        if (submitResponse.data.user) {
          setForm((prev) => ({
            ...prev,
            studentIdCard: submitResponse.data.user.studentIdCard || prev.studentIdCard,
            nationalIdCard:
              submitResponse.data.user.nationalIdCard || prev.nationalIdCard,
            identityVerificationStatus:
              submitResponse.data.user.identityVerificationStatus ||
              prev.identityVerificationStatus,
          }));
          updateUser(submitResponse.data.user);
        }

        toast.success("Verification documents submitted successfully");
      }

      toast.success(`${type === "student" ? "Student ID" : "National ID"} uploaded successfully`);
    } catch {
      toast.error("Failed to upload document");
    } finally {
      if (type === "student") setStudentIdUploading(false);
      if (type === "national") setNationalIdUploading(false);
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
        studentIdCard: form.studentIdCard,
        nationalIdCard: form.nationalIdCard,
        latestEducation: form.latestEducation,
        specialization: form.specialization,
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

  const handleReviewDraftChange = (paymentId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [paymentId]: {
        rating: prev[paymentId]?.rating || "",
        comment: prev[paymentId]?.comment || "",
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (paymentId) => {
    const draft = reviewDrafts[paymentId] || {};
    const rating = Number(draft.rating);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      toast.error("Please select rating between 1 and 5");
      return;
    }

    setSubmittingReviewPaymentId(paymentId);
    try {
      const response = await axiosInstance.post(API_PATHS.REVIEWS.CREATE, {
        paymentId,
        rating,
        comment: draft.comment || "",
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to submit review");
        return;
      }

      toast.success("Review submitted");
      setEligibleReviews((prev) => prev.filter((item) => item.paymentId !== paymentId));
      setReviewDrafts((prev) => {
        const next = { ...prev };
        delete next[paymentId];
        return next;
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReviewPaymentId("");
    }
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
            <p className="text-sm mt-2 text-blue-100">Update your details, resume, ID cards, bio, interests and password</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className={`rounded-2xl border shadow-sm p-6 ${cardClass}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={`font-semibold text-base ${textPrimary}`}>Profile Completion</h2>
              <p className={`text-sm mt-1 ${textSecondary}`}>
                Complete the missing sections to make your profile stronger.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              {profileStatus.completion}% Complete
            </span>
          </div>

          <div className={`mt-4 h-2.5 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-gray-200"}`}>
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${profileStatus.completion}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profileStatus.items.map((item) => (
              <div
                key={item.key}
                className={`rounded-xl border px-3 py-2.5 flex items-center justify-between ${
                  isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"
                }`}
              >
                <span className={`text-sm font-medium ${textPrimary}`}>{item.label}</span>
                <span
                  className={`text-xs font-semibold ${
                    item.completed ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {item.completed ? "Done" : "Add/Update"}
                </span>
              </div>
            ))}
          </div>
        </div>

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

              <div>
                <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>Latest Education</label>
                <select
                  name="latestEducation"
                  value={form.latestEducation}
                  onChange={(event) => {
                    const nextEducation = event.target.value;
                    setForm((prev) => {
                      const next = { ...prev, latestEducation: nextEducation };
                      if (!SPECIALIZATIONS[nextEducation]?.includes(prev.specialization)) {
                        next.specialization = "";
                      }
                      return next;
                    });
                  }}
                  className={`w-full mt-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                      : "border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select education level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>Specialization</label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  disabled={!form.latestEducation}
                  className={`w-full mt-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50"
                      : "border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50"
                  }`}
                >
                  <option value="">Select specialization</option>
                  {specializationOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
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

          <div className={`rounded-2xl border shadow-sm p-6 space-y-4 ${cardClass}`}>
            <h2 className={`font-semibold text-base flex items-center gap-2 ${textPrimary}`}>
              <FileBadge className="h-4 w-4 text-blue-500" />
              Identity Verification
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-full font-medium ${
                form.identityVerificationStatus === "verified"
                  ? "bg-green-50 text-green-700"
                  : form.identityVerificationStatus === "pending"
                    ? "bg-amber-50 text-amber-700"
                    : form.identityVerificationStatus === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-600"
              }`}>
                {form.identityVerificationStatus === "verified"
                  ? "Verified"
                  : form.identityVerificationStatus === "pending"
                    ? "Verification Pending"
                    : form.identityVerificationStatus === "rejected"
                      ? "Verification Rejected"
                      : "Not Submitted"}
              </span>
              <span className={textSecondary}>
                Upload both documents to submit verification.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`border rounded-xl p-4 ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                <p className={`text-sm font-medium mb-2 ${textPrimary}`}>Student ID Card</p>
                {form.studentIdCard ? (
                  <a
                    href={form.studentIdCard}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    View uploaded Student ID
                  </a>
                ) : (
                  <p className={`text-xs ${textSecondary}`}>Not uploaded</p>
                )}
                <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-xs text-blue-600 hover:text-blue-700 font-medium">
                  {studentIdUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {studentIdUploading ? "Uploading..." : "Upload Student ID"}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(event) => handleVerificationDocUpload(event, "student")}
                    className="hidden"
                  />
                </label>
              </div>

              <div className={`border rounded-xl p-4 ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                <p className={`text-sm font-medium mb-2 ${textPrimary}`}>National ID Card</p>
                {form.nationalIdCard ? (
                  <a
                    href={form.nationalIdCard}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    View uploaded National ID
                  </a>
                ) : (
                  <p className={`text-xs ${textSecondary}`}>Not uploaded</p>
                )}
                <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-xs text-blue-600 hover:text-blue-700 font-medium">
                  {nationalIdUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {nationalIdUploading ? "Uploading..." : "Upload National ID"}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(event) => handleVerificationDocUpload(event, "national")}
                    className="hidden"
                  />
                </label>
              </div>
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
            <span className="font-semibold">Latest Education:</span> {form.latestEducation || "Not added"}
          </p>
          <p className={`text-sm mt-2 ${textSecondary}`}>
            <span className="font-semibold">Specialization:</span> {form.specialization || "Not added"}
          </p>
          <p className={`text-sm mt-2 ${textSecondary}`}>
            <span className="font-semibold">Interests:</span> {form.interests || "Not added"}
          </p>
          <p className={`text-sm mt-2 ${textSecondary}`}>
            <span className="font-semibold">LinkedIn:</span> {form.linkedinUrl || "Not added"}
          </p>
        </div>

        {showFeedbackAndRatings ? (
          <>
            <div className={`rounded-2xl border shadow-sm p-6 ${cardClass}`}>
              <h2 className={`font-semibold text-base mb-3 ${textPrimary}`}>
                Rate Employers (Completed Projects)
              </h2>
              {eligibleReviews.length === 0 ? (
                <p className={`text-sm ${textSecondary}`}>No pending employer reviews.</p>
              ) : (
                <div className="space-y-3">
                  {eligibleReviews.map((item) => {
                    const draft = reviewDrafts[item.paymentId] || {
                      rating: "",
                      comment: "",
                    };

                    return (
                      <div
                        key={item.paymentId}
                        className={`rounded-xl border p-3 ${isDark ? "border-slate-700" : "border-gray-200"}`}
                      >
                        <p className={`text-sm font-medium ${textPrimary}`}>
                          {item.reviewee?.name || "Employer"}
                        </p>
                        <p className={`text-xs mb-2 ${textSecondary}`}>{item.job?.title || "Project"}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-2">
                          <div
                            className={`flex items-center gap-1 px-2 py-2 border rounded-lg ${
                              isDark
                                ? "border-slate-700 bg-slate-800"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            {[1, 2, 3, 4, 5].map((star) => {
                              const selected = Number(draft.rating || 0) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    handleReviewDraftChange(item.paymentId, "rating", String(star))
                                  }
                                  className="p-0.5"
                                  title={`${star} star${star > 1 ? "s" : ""}`}
                                >
                                  <Star
                                    className={`h-5 w-5 ${selected ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <input
                            type="text"
                            value={draft.comment}
                            onChange={(event) =>
                              handleReviewDraftChange(item.paymentId, "comment", event.target.value)
                            }
                            placeholder="Write feedback"
                            className={`px-3 py-2 border rounded-lg text-sm ${
                              isDark
                                ? "border-slate-700 bg-slate-800 text-slate-100"
                                : "border-gray-200 bg-white text-gray-900"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmitReview(item.paymentId)}
                            disabled={submittingReviewPaymentId === item.paymentId}
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                          >
                            {submittingReviewPaymentId === item.paymentId ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`rounded-2xl border shadow-sm p-6 ${cardClass}`}>
              <h2 className={`font-semibold text-base mb-1 ${textPrimary}`}>Your Freelancer Reviews</h2>
              <p className={`text-sm mb-3 ${textSecondary}`}>
                Average rating: <span className="font-semibold">{averageRating || 0}</span> / 5
              </p>

              {receivedReviews.length === 0 ? (
                <p className={`text-sm ${textSecondary}`}>No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {receivedReviews.slice(0, 5).map((review) => (
                    <div
                      key={review._id}
                      className={`rounded-xl border p-3 ${isDark ? "border-slate-700" : "border-gray-200"}`}
                    >
                      <p className={`text-sm font-medium ${textPrimary}`}>
                        {review.reviewer?.name || "User"} • {review.rating}/5
                      </p>
                      <p className={`text-xs ${textSecondary}`}>{review.job?.title || "Project"}</p>
                      {review.comment ? (
                        <p className={`text-sm mt-1 ${textSecondary}`}>{review.comment}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default UserProfile;
