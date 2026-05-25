import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BedDouble, Wallet, Users, MapPin, FileText, CheckSquare, ArrowLeft } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextAreaField = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <textarea
      {...props}
      className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition resize-none ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const RoomPostingForm = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const isEditMode = Boolean(roomId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingRoom, setIsFetchingRoom] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    hotelName: "",
    title: "",
    description: "",
    amenities: "",
    city: "",
    roomType: "standard",
    pricePerNight: "",
    maxGuests: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  useEffect(() => {
    const fetchRoom = async () => {
      if (!isEditMode) return;
      try {
        setIsFetchingRoom(true);
        const response = await axiosInstance.get(API_PATHS.ROOMS.GET_BY_ID(roomId));
        if (!response.data.success || !response.data.room) {
          toast.error(response.data.message || "Failed to load room details");
          navigate("/manage-rooms");
          return;
        }

        const room = response.data.room;
        setForm({
          hotelName: room.hotelName || "",
          title: room.title || "",
          description: room.description || "",
          amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : (room.amenities || ""),
          city: room.city || "",
          roomType: room.roomType || "standard",
          pricePerNight: room.pricePerNight ?? "",
          maxGuests: room.maxGuests ?? "",
        });
      } catch {
        toast.error("Failed to load room details");
        navigate("/manage-rooms");
      } finally {
        setIsFetchingRoom(false);
      }
    };

    fetchRoom();
  }, [isEditMode, roomId, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!form.hotelName.trim()) newErrors.hotelName = "Hotel name is required";
    if (!form.title.trim()) newErrors.title = "Room title is required";
    if (!form.description.trim()) newErrors.description = "Room description is required";
    if (!form.amenities.trim()) newErrors.amenities = "Amenities are required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.roomType) newErrors.roomType = "Room type is required";
    if (!form.pricePerNight) newErrors.pricePerNight = "Price per night is required";
    if (!form.maxGuests) newErrors.maxGuests = "Maximum guests is required";
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
        amenities: form.amenities.split(",").map((amenity) => amenity.trim()).filter(Boolean),
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
      };

      const response = isEditMode
        ? await axiosInstance.put(API_PATHS.ROOMS.UPDATE(roomId), payload)
        : await axiosInstance.post(API_PATHS.ROOMS.CREATE, payload);

      if (response.data.success) {
        toast.success(isEditMode ? "Room updated successfully!" : "Room created successfully!");
        navigate("/manage-rooms");
      } else {
        toast.error(response.data.message || (isEditMode ? "Failed to update room" : "Failed to create room"));
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeMenu="manage-rooms">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Room" : "Add a New Room"}</h1>
            <p className="text-sm text-gray-500">{isEditMode ? "Update your room listing details" : "Fill in all fields to create a room listing"}</p>
          </div>
        </div>

        {isFetchingRoom ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex items-center justify-center">
            <span className="h-5 w-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-blue-500" />
                Room Details
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <InputField label="Hotel Name" name="hotelName" placeholder="e.g. Hotel Annapurna" value={form.hotelName} onChange={handleChange} error={errors.hotelName} />
                <InputField label="Room Title" name="title" placeholder="e.g. Deluxe Double Room" value={form.title} onChange={handleChange} error={errors.title} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="City" name="city" placeholder="e.g. Kathmandu" icon={MapPin} value={form.city} onChange={handleChange} error={errors.city} />
                  <InputField label="Room Type" name="roomType" placeholder="standard / deluxe / suite" value={form.roomType} onChange={handleChange} error={errors.roomType} />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Description &amp; Amenities
              </h2>
              <div className="space-y-4">
                <TextAreaField label="Room Description" name="description" placeholder="Describe the room, view, bed setup, and guest experience..." rows={5} value={form.description} onChange={handleChange} error={errors.description} />
                <TextAreaField label="Amenities" name="amenities" placeholder="Wi-Fi, breakfast, AC, parking, etc." rows={4} value={form.amenities} onChange={handleChange} error={errors.amenities} />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" />
                Pricing &amp; Capacity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Price per Night (NPR)" name="pricePerNight" type="number" min="0" placeholder="e.g. 3500" icon={Wallet} value={form.pricePerNight} onChange={handleChange} error={errors.pricePerNight} />
                <InputField label="Maximum Guests" name="maxGuests" type="number" min="1" placeholder="e.g. 2" icon={Users} value={form.maxGuests} onChange={handleChange} error={errors.maxGuests} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate("/manage-rooms")} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    {isEditMode ? "Update Room" : "Save Room"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RoomPostingForm;
