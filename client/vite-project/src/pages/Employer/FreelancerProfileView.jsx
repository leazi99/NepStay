import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Mail,
  Link as LinkIcon,
  FileText,
  MessageCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const FreelancerProfileView = () => {
  const { freelancerId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await axiosInstance.get(
          API_PATHS.USERS.GET_PUBLIC_PROFILE(freelancerId),
        );

        if (!response.data.success || !response.data.user) {
          setError(response.data.message || "Failed to load freelancer profile");
          return;
        }

        setProfile(response.data.user);
      } catch {
        setError("Failed to load freelancer profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [freelancerId]);

  const handleMessageFreelancer = async () => {
    if (!profile?._id) return;

    setStartingChat(true);
    try {
      const response = await axiosInstance.post(API_PATHS.MESSAGES.CREATE_OR_GET_ROOM, {
        participantId: profile._id,
      });

      if (!response.data.success || !response.data.room?._id) {
        toast.error(response.data.message || "Failed to start chat");
        return;
      }

      navigate(`/messages?roomId=${response.data.room._id}`);
    } catch {
      toast.error("Failed to start chat");
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Freelancer Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View candidate details before decision
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-blue-600">
                    {profile?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">{profile?.name || "Unknown"}</h2>
                <p className="text-sm text-gray-500 mt-1">{profile?.role || "freelancer"}</p>

                <div className="mt-3">
                  <button
                    onClick={handleMessageFreelancer}
                    disabled={startingChat}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  >
                    {startingChat ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                    {startingChat ? "Opening chat..." : "Message Freelancer"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {profile?.email || "—"}
                  </span>

                  {profile?.linkedinUrl ? (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      LinkedIn
                    </a>
                  ) : null}

                  {profile?.resume ? (
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Bio
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {profile?.bio || "No bio added"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Interests
                </p>
                {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">No interests added</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FreelancerProfileView;