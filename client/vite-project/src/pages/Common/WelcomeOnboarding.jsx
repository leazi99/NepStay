import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import assets from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const normalizeRole = (role) => {
  const value = String(role || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (["client", "employer"].includes(value)) return "employer";
  if (["freelancer", "jobseeker", "job seeker"].includes(value)) return "jobseeker";
  if (value === "admin") return "admin";
  return value;
};

const toBoolean = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value || "").trim());
};

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

const WelcomeOnboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [latestEducation, setLatestEducation] = useState(user?.latestEducation || "");
  const [specialization, setSpecialization] = useState(user?.specialization || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = normalizeRole(user?.role);

  const completion = useMemo(() => {
    if (!user) return 0;

    const jobSeekerChecks = [
      toBoolean(user?.name),
      toBoolean(user?.email),
      toBoolean(user?.avatar),
      toBoolean(user?.bio),
      toBoolean(user?.resume),
      toBoolean(user?.linkedinUrl),
      toBoolean(user?.interests),
      toBoolean(user?.latestEducation),
      toBoolean(user?.specialization),
      toBoolean(user?.studentIdCard),
      toBoolean(user?.nationalIdCard),
      String(user?.identityVerificationStatus || "") !== "not_submitted",
      String(user?.identityVerificationStatus || "") === "verified",
    ];

    const employerChecks = [
      toBoolean(user?.name),
      toBoolean(user?.email),
      toBoolean(user?.avatar),
      toBoolean(user?.companyName),
      toBoolean(user?.companyDescription),
      toBoolean(user?.companyLogo),
      toBoolean(user?.bio),
      toBoolean(user?.linkedinUrl),
      String(user?.identityVerificationStatus || "") !== "not_submitted",
    ];

    const checks = role === "employer" ? employerChecks : jobSeekerChecks;
    const completed = checks.filter(Boolean).length;
    return Math.min(100, Math.round((completed / checks.length) * 100));
  }, [role, user]);

  const specializationOptions = SPECIALIZATIONS[latestEducation] || [];

  const goToDashboard = () => {
    if (role === "admin") {
      navigate("/admin-dashboard");
      return;
    }
    navigate(role === "employer" ? "/employer-dashboard" : "/freelancer-dashboard");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (role !== "jobseeker") {
      goToDashboard();
      return;
    }

    if (!latestEducation) {
      toast.error("Please choose your latest education");
      return;
    }

    if (!specialization) {
      toast.error("Please choose your specialization");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, {
        latestEducation,
        specialization,
      });

      if (!data?.success) {
        toast.error(data?.message || "Failed to save onboarding details");
        return;
      }

      updateUser({ latestEducation, specialization });
      toast.success("Profile details saved");
      goToDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save onboarding details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-100 py-10 px-6 sm:px-10 text-center">
        <img src={assets.kaamlogo} alt="KaamSathi" className="h-10 sm:h-12 mx-auto" />

        <h1 className="mt-8 text-3xl sm:text-4xl font-semibold text-gray-800">Welcome, {user?.name || "User"}</h1>

        <img
          src={assets.hand_wave}
          alt="Welcome"
          className="h-12 w-12 mx-auto mt-8"
        />

        <p className="mt-8 text-gray-700 text-lg">We&apos;re excited to have you join us</p>

        <div className="mt-8 rounded-2xl bg-amber-100/80 px-4 sm:px-6 py-5 text-left">
          <p className="text-lg text-gray-700">
            Your Profile is currently <span className="text-red-500 font-semibold">{completion}% complete.</span>
          </p>
          <div className="mt-4 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-400 transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {role === "jobseeker" ? (
          <div className="mt-10 text-left">
            <label className="block text-2xl font-medium text-gray-700 mb-3">
              Choose your Latest Education <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={latestEducation}
                onChange={(event) => {
                  const selectedEducation = event.target.value;
                  setLatestEducation(selectedEducation);
                  if (!SPECIALIZATIONS[selectedEducation]?.includes(specialization)) {
                    setSpecialization("");
                  }
                }}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Education Level</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>

            <div className="relative mt-3">
              <select
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/30"
                disabled={!latestEducation}
              >
                <option value="">Choose Specialization</option>
                {specializationOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={handleBack}
                className="h-11 w-11 rounded-lg border border-blue-500 text-blue-600 text-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                ←
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xl font-semibold transition-colors"
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={goToDashboard}
            className="mt-10 inline-flex items-center justify-center px-10 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold transition-colors"
          >
            Let&apos;s Begin
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeOnboarding;