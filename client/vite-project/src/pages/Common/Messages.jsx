import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Send, MessageCircle, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";
import DashboardLayout from "../../components/layout/DashboardLayout";

const MessagesContent = ({ isDark, userRole, userId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(searchParams.get("roomId") || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const activeRoom = useMemo(
    () => rooms.find((room) => room._id === activeRoomId),
    [rooms, activeRoomId]
  );

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const response = await axiosInstance.get(API_PATHS.MESSAGES.GET_ROOMS);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to load rooms");
        return;
      }
      setRooms(response.data.rooms || []);

      if (!activeRoomId && response.data.rooms?.length) {
        const nextRoom = searchParams.get("roomId") || response.data.rooms[0]._id;
        setActiveRoomId(nextRoom);
      }
    } catch {
      toast.error("Failed to load chat rooms");
    } finally {
      setLoadingRooms(false);
    }
  }, [activeRoomId, searchParams]);

  const fetchMessages = async (roomId) => {
    if (!roomId) return;
    setLoadingMessages(true);
    try {
      const response = await axiosInstance.get(API_PATHS.MESSAGES.GET_MESSAGES_BY_ROOM(roomId));
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to load messages");
        return;
      }
      setMessages(response.data.messages || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (!activeRoomId) return;
    setSearchParams({ roomId: activeRoomId });
    fetchMessages(activeRoomId);
  }, [activeRoomId, setSearchParams]);

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    if (!participantEmail.trim()) return;

    try {
      const response = await axiosInstance.post(API_PATHS.MESSAGES.CREATE_OR_GET_ROOM, {
        participantEmail: participantEmail.trim(),
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to create chat");
        return;
      }

      const room = response.data.room;
      setParticipantEmail("");

      setRooms((prev) => {
        const exists = prev.some((item) => item._id === room._id);
        if (exists) {
          return prev.map((item) => (item._id === room._id ? room : item));
        }
        return [room, ...prev];
      });

      setActiveRoomId(room._id);
      toast.success("Chat ready");
    } catch {
      toast.error("Failed to create chat");
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!activeRoomId || !text.trim()) return;

    setSending(true);
    try {
      const response = await axiosInstance.post(API_PATHS.MESSAGES.SEND_MESSAGE(activeRoomId), {
        text,
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to send message");
        return;
      }

      const newMessage = response.data.message;
      setMessages((prev) => [...prev, newMessage]);
      setText("");

      setRooms((prev) =>
        prev.map((room) =>
          room._id === activeRoomId
            ? {
                ...room,
                lastMessage: {
                  _id: newMessage._id,
                  text: newMessage.text,
                  sender: newMessage.sender?._id || userId,
                  createdAt: newMessage.createdAt,
                },
                updatedAt: newMessage.createdAt,
              }
            : room
        )
      );
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-70px)] ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      {userRole === "jobseeker" ? <FreelancerNavbar active="messages" /> : null}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[72vh]">
            <aside className={`border-r ${isDark ? "border-slate-700 bg-slate-850" : "border-gray-200 bg-gray-50"}`}>
              <div className="p-4 border-b border-inherit space-y-3">
                <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Messages</h2>
                <form onSubmit={handleCreateRoom} className="flex gap-2">
                  <input
                    type="email"
                    value={participantEmail}
                    onChange={(event) => setParticipantEmail(event.target.value)}
                    placeholder="Start chat by email"
                    className={`flex-1 px-3 py-2 text-sm rounded-xl border ${
                      isDark
                        ? "border-slate-600 bg-slate-800 text-slate-100"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    title="Start chat"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="overflow-y-auto h-[calc(72vh-100px)]">
                {loadingRooms ? (
                  <div className="p-4 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading chats...
                  </div>
                ) : rooms.length === 0 ? (
                  <div className={`p-4 text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    No chats yet.
                  </div>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room._id}
                      onClick={() => setActiveRoomId(room._id)}
                      className={`w-full text-left px-4 py-3 border-b border-inherit transition-colors ${
                        activeRoomId === room._id
                          ? isDark
                            ? "bg-blue-900/30"
                            : "bg-blue-50"
                          : isDark
                            ? "hover:bg-slate-700"
                            : "hover:bg-gray-100"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                        {room.otherParticipant?.name || "Unknown user"}
                      </p>
                      <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                        {room.lastMessage?.text || "No messages yet"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="flex flex-col">
              <div className={`px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                <h3 className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  {activeRoom ? activeRoom.otherParticipant?.name : "Select a conversation"}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!activeRoomId ? (
                  <div className={`h-full flex items-center justify-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4" />
                      Pick a conversation to start chatting.
                    </div>
                  </div>
                ) : loadingMessages ? (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    No messages yet. Say hello 👋
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = String(message.sender?._id || message.sender) === String(userId);
                    return (
                      <div
                        key={message._id}
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          isMine
                            ? "ml-auto bg-blue-600 text-white"
                            : isDark
                              ? "bg-slate-700 text-slate-100"
                              : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-blue-100" : isDark ? "text-slate-400" : "text-gray-500"}`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className={`p-3 border-t ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Type your message..."
                    className={`flex-1 px-3 py-2 text-sm rounded-xl border ${
                      isDark
                        ? "border-slate-600 bg-slate-800 text-slate-100"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={sending || !activeRoomId}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isDark = (user?.themePreference || "light") === "dark";
  const isFreelancerRole = user?.role === "jobseeker" || user?.role === "freelancer";
  const isFreelancerMessagesRoute = location.pathname === "/freelancer/messages";

  if (!isFreelancerRole && !isFreelancerMessagesRoute && user?.role === "employer") {
    return (
      <DashboardLayout activeMenu="messages">
        <MessagesContent isDark={isDark} userRole={user?.role} userId={user?._id} />
      </DashboardLayout>
    );
  }

  return <MessagesContent isDark={isDark} userRole={isFreelancerRole ? "jobseeker" : user?.role} userId={user?._id} />;
};

export default Messages;
