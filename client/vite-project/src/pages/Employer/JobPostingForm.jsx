import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Briefcase, DollarSign, Clock, MapPin, FileText, CheckSquare, ArrowLeft } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";

const LOCATIONS = ["Remote", "On-Site", "Hybrid"];

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      )}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
          }`}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const SelectField = ({ label, options, error, placeholder, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition appearance-none bg-white ${error ? "border-red-400 bg-red-50" : "border-gray-200"
        }`}
    >
      <option value="">{placeholder || "Select..."}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
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

const JobPostingForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    category: "",
    salaryMin: "",
    salaryMax: "",
    duration: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Job title is required";
    if (!form.description.trim()) newErrors.description = "Job description is required";
    if (!form.requirements.trim()) newErrors.requirements = "Requirements are required";
    if (!form.location) newErrors.location = "Please select a job type";
    if (!form.salaryMin) newErrors.salaryMin = "Minimum salary is required";
    if (!form.salaryMax) newErrors.salaryMax = "Maximum salary is required";
    if (Number(form.salaryMin) > Number(form.salaryMax))
      newErrors.salaryMax = "Max salary must be ≥ min salary";
    if (!form.duration.trim()) newErrors.duration = "Duration is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
      };
      const response = await axiosInstance.post(API_PATHS.JOBS.POST_JOB, payload);
      if (response.data.success) {
        toast.success("Job posted successfully!");
        navigate("/manage-jobs");
      } else {
        toast.error(response.data.message || "Failed to post job");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeMenu="post-job">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-sm text-gray-500">Fill in all fields to create a job listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Job Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="Job Title *"
                name="title"
                placeholder="e.g. Senior React Developer"
                value={form.title}
                onChange={handleChange}
                error={errors.title}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Job Type / Location *"
                  name="location"
                  options={JOB_TYPES}
                  placeholder="Select job type"
                  value={form.location}
                  onChange={handleChange}
                  error={errors.location}
                />
                <SelectField
                  label="Category"
                  name="category"
                  options={CATEGORIES}
                  placeholder="Select category"
                  value={form.category}
                  onChange={handleChange}
                  error={errors.category}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Description &amp; Requirements
            </h2>
            <div className="space-y-4">
              <TextAreaField
                label="Job Description *"
                name="description"
                placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                rows={5}
                value={form.description}
                onChange={handleChange}
                error={errors.description}
              />
              <TextAreaField
                label="Requirements *"
                name="requirements"
                placeholder="List required skills, experience, qualifications..."
                rows={4}
                value={form.requirements}
                onChange={handleChange}
                error={errors.requirements}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Compensation */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Compensation &amp; Duration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="Min Salary ($/mo) *"
                name="salaryMin"
                type="number"
                min="0"
                placeholder="e.g. 3000"
                icon={DollarSign}
                value={form.salaryMin}
                onChange={handleChange}
                error={errors.salaryMin}
              />
              <InputField
                label="Max Salary ($/mo) *"
                name="salaryMax"
                type="number"
                min="0"
                placeholder="e.g. 6000"
                icon={DollarSign}
                value={form.salaryMax}
                onChange={handleChange}
                error={errors.salaryMax}
              />
              <InputField
                label="Duration *"
                name="duration"
                placeholder="e.g. Full-time, 6 months"
                icon={Clock}
                value={form.duration}
                onChange={handleChange}
                error={errors.duration}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/manage-jobs")}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;
