import {
  Search,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Award,
  Briefcase,
  Building2,
  LayoutDashboard,
  Plus,
  Bell,
  Wallet,
} from "lucide-react";

export const jobSeekerFeatures = [
  {
    icon: Search,
    title: "Powerful Job Search",
    description:
      "Easily find jobs that match your skills and preferences with our advanced search filters.",
  },
  {
    icon: FileText,
    title: "One-Click Applications",
    description:
      "Apply to jobs with a single click using your saved profile and resume.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Communication",
    description:
      "Chat directly with employers and receive instant updates on your applications.",
  },
  {
    icon: BarChart3,
    title: "Personalized Job Recommendations",
    description:
      "Get job suggestions tailored to your profile and application history.",
  },
];

export const employerFeatures = [
  {
    icon: Plus,
    title: "Post Jobs Easily",
    description:
      "Create and publish job listings in minutes with our intuitive job posting tool.",
  },
  {
    icon: Users,
    title: "Manage Candidates",
    description:
      "Review applications, schedule interviews, and track candidate progress effortlessly.",
  },
  {
    icon: LayoutDashboard,
    title: "Employer Dashboard",
    description:
      "Get insights into your job postings and hiring performance with our powerful dashboard.",
  },
  {
    icon: Briefcase,
    title: "Company Profile",
    description:
      "Showcase your company culture and attract top talent with a customized profile.",
  },
];

export const NAVIGATION_MENU = [
  { id: "employer-dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "post-job", name: "Post Job", icon: Plus },
  { id: "manage-jobs", name: "Manage Jobs", icon: Briefcase },
  { id: "payments", name: "Payments", icon: Wallet },
  { id: "messages", name: "Messages", icon: MessageSquare },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "company-profile", name: "Company Profile", icon: Building2 },
];

export const CATEGORIES = [
  { value: "Engineering", label: "Engineering" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "It & Software", label: "It & Software" },
  { value: "Customer-Service", label: "Customer Service" },
  { value: "Product", label: "Product" },
  { value: "Operations", label: "Operations" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "Human Resources" },
  { value: "Other", label: "Other" },
];

export const JOB_TYPES = [
  { value: "Remote", label: "Remote" },
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

export const SALARY_RANGES = [
  "Less than $1000",
  "$1000-$15,000",
  "More than $15,000",
];
