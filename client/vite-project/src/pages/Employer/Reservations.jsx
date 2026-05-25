import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Clock,
  Search,
  SlidersHorizontal,
  BedDouble,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

const statusConfig = {
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Circle,
  },
  Confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  "Checked-In": {
    label: "Checked-In",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    icon: Users,
  },
  Completed: {
    label: "Completed",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

const Reservations = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rooms, setRooms] = useState([]);
  const [reservationsByRoom, setReservationsByRoom] = useState({});

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const roomsResponse = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      if (!roomsResponse?.data?.success) {
        throw new Error(roomsResponse?.data?.message || "Failed to load rooms");
      }

      let roomList = [];
      if (Array.isArray(roomsResponse.data.rooms)) {
        roomList = roomsResponse.data.rooms;
      } else if (Array.isArray(roomsResponse.data.jobs)) {
        roomList = roomsResponse.data.jobs;
      }

      setRooms(roomList);

      const reservationsResponse = await Promise.all(
        roomList.map(async (room) => {
          try {
            const response = await axiosInstance.get(
              API_PATHS.APPLICATIONS.GET_APPLICATIONS_FOR_JOB(room._id),
            );

            if (!response?.data?.success || !Array.isArray(response.data.applications)) {
              return [room._id, []];
            }

            return [room._id, response.data.applications];
          } catch {
            return [room._id, []];
          }
        }),
      );

      setReservationsByRoom(Object.fromEntries(reservationsResponse));
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const reservationRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rooms.flatMap((room) => {
      const roomReservations = reservationsByRoom[room._id] || [];

      return roomReservations.map((reservation) => ({
        room,
        reservation,
      }));
    }).filter(({ room, reservation }) => {
      const status = String(reservation.status || "Pending");
      const guestName = String(reservation.applicant?.name || "").toLowerCase();
      const guestEmail = String(reservation.applicant?.email || "").toLowerCase();
      const roomTitle = String(room.title || room.jobLocation || "").toLowerCase();
      const roomNumber = String(room.roomNumber || "").toLowerCase();
      const matchesSearch =
        !query ||
        guestName.includes(query) ||
        guestEmail.includes(query) ||
        roomTitle.includes(query) ||
        roomNumber.includes(query);
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((first, second) => new Date(second.reservation.createdAt) - new Date(first.reservation.createdAt));
  }, [rooms, reservationsByRoom, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    const allReservations = rooms.flatMap((room) => reservationsByRoom[room._id] || []);
    return {
      totalRooms: rooms.length,
      totalReservations: allReservations.length,
      pending: allReservations.filter((reservation) => reservation.status === "Pending").length,
      confirmed: allReservations.filter((reservation) => reservation.status === "Confirmed").length,
    };
  }, [rooms, reservationsByRoom]);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  let reservationsContent;
  if (isLoading) {
    reservationsContent = (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading reservations...
      </div>
    );
  } else if (error) {
    reservationsContent = (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  } else if (reservationRows.length === 0) {
    reservationsContent = (
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 px-6 text-center">
        <CalendarClock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">No reservations found</h2>
        <p className="text-sm text-gray-500 mt-1">
          Once guests reserve your rooms, they will appear here for review and management.
        </p>
      </div>
    );
  } else {
    reservationsContent = (
      <div className="space-y-4">
        {reservationRows.map(({ room, reservation }) => {
          const status = statusConfig[reservation.status] || statusConfig.Pending;
          const StatusIcon = status.icon;

          return (
            <div key={reservation._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      <MapPin className="h-3.5 w-3.5" /> Room {room.roomNumber || "—"}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 truncate">{room.title || room.description || "Room reservation"}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {room.jobLocation || room.category || room.roomType || "Hotel room"}
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{reservation.applicant?.name || "Guest"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span>{reservation.applicant?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Requested {formatDate(reservation.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-gray-400" />
                      <span>{room.pricePerNight ? `NPR ${Number(room.pricePerNight).toLocaleString()} / night` : "Price unavailable"}</span>
                    </div>
                  </div>
                </div>

                <div className="min-w-[220px] rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Stay notes</div>
                  <div className="mt-2 text-sm text-gray-700 leading-6">
                    {reservation.resume || reservation.notes || room.description || "No extra notes provided."}
                  </div>
                  <button
                    onClick={() => navigate(`/booking-requests/${room._id}`)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Open room reservations <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <DashboardLayout activeMenu="reservations">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold uppercase tracking-wide mb-3">
              <CalendarClock className="h-3.5 w-3.5" /> Reservations
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reservation Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review room requests, confirm stays, and keep every guest booking in one place.
            </p>
          </div>
          <button
            onClick={() => navigate("/hotel-staff-dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Back to Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Rooms", value: summary.totalRooms, icon: BedDouble, tone: "bg-blue-600" },
            { label: "Reservations", value: summary.totalReservations, icon: CalendarClock, tone: "bg-emerald-600" },
            { label: "Pending", value: summary.pending, icon: Clock, tone: "bg-amber-600" },
            { label: "Confirmed", value: summary.confirmed, icon: CheckCircle2, tone: "bg-sky-600" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-11 w-11 rounded-xl ${item.tone} flex items-center justify-center text-white`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between shadow-sm">
          <div className="relative w-full lg:max-w-md">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search guest name, email, room number, or room title"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="all">All status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {reservationsContent}
      </div>
    </DashboardLayout>
  );
};

export default Reservations;