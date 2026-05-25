import {
  Search,
  Users,
  MessageSquare,
  Building2,
  LayoutDashboard,
  Plus,
  Bell,
  Wallet,
  Star,
  BedDouble,
  CalendarClock,
  ConciergeBell,
} from "lucide-react";

export const customerFeatures = [
  {
    icon: Search,
    title: "Find the Right Stay",
    description:
      "Discover hotels and rooms that match your trip, budget, and preferred amenities.",
  },
  {
    icon: BedDouble,
    title: "Book in Seconds",
    description:
      "Reserve rooms quickly with saved guest details, date selection, and instant confirmation.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Support",
    description:
      "Message hotel staff for special requests, booking changes, and on-stay assistance.",
  },
  {
    icon: Star,
    title: "Personalized Recommendations",
    description:
      "Get hotel and room suggestions tailored to your travel history and preferences.",
  },
];

export const hotelStaffFeatures = [
  {
    icon: Plus,
    title: "Manage Rooms Easily",
    description:
      "Create rooms, update availability, and publish details with a simple workflow.",
  },
  {
    icon: Users,
    title: "Manage Guests",
    description:
      "Track reservations, check-ins, and guest preferences from one dashboard.",
  },
  {
    icon: LayoutDashboard,
    title: "Staff Dashboard",
    description:
      "View occupancy, revenue, booking trends, and daily operations at a glance.",
  },
  {
    icon: Building2,
    title: "Hotel Profile",
    description:
      "Showcase property details, amenities, location, and branding with a polished profile.",
  },
];

export const staffFeatures = hotelStaffFeatures;
export const jobSeekerFeatures = customerFeatures;
export const employerFeatures = hotelStaffFeatures;

export const hotelStaffNavigationMenu = [
  {
    id: "hotel-staff-dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/hotel-staff-dashboard",
  },
  { id: "manage-rooms", name: "Rooms", icon: BedDouble, path: "/manage-rooms" },
  {
    id: "reservations",
    name: "Reservations",
    icon: CalendarClock,
    path: "/reservations",
  },
  {
    id: "room-service",
    name: "Room Service",
    icon: ConciergeBell,
    path: "/messages",
  },
  { id: "payments", name: "Payments", icon: Wallet, path: "/payments" },
  { id: "reviews", name: "Reviews", icon: Star, path: "/reviews" },
  { id: "messages", name: "Messages", icon: MessageSquare, path: "/messages" },
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    id: "hotel-profile",
    name: "Hotel Profile",
    icon: Building2,
    path: "/hotel-profile",
  },
];

export const roomCategories = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "vip-suite", label: "VIP Suite" },
  { value: "family", label: "Family Room" },
  { value: "presidential", label: "Presidential" },
];

export const roomTypes = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "vip-suite", label: "VIP Suite" },
];

export const priceRanges = [
  "Less than NPR 2,500",
  "NPR 2,500 - NPR 7,500",
  "NPR 7,500 - NPR 15,000",
  "More than NPR 15,000",
];

export const NAVIGATION_MENU = hotelStaffNavigationMenu;
export const CATEGORIES = roomCategories;
export const JOB_TYPES = roomTypes;
export const SALARY_RANGES = priceRanges;
