import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Send, MessageCircle, Loader2, Search, UserPlus } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import { getStoredAuthToken } from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";
import DashboardLayout from "../../components/layout/DashboardLayout";

const formatLastSeen = (value) => {
  if (!value) return "Offline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Offline";

  const diffMs = Math.max(Date.now() - date.getTime(), 0);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 1) return "Last seen just now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `Last seen ${diffDays}d ago`;
};

const MessagesContent = ({ isDark, userRole, userId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(searchParams.get("roomId") || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleResults, setPeopleResults] = useState([]);
  const [connectingUserId, setConnectingUserId] = useState("");
  const socketRef = useRef(null);
  const activeRoomIdRef = useRef(activeRoomId);

  const activeRoom = useMemo(
    () => rooms.find((room) => room._id === activeRoomId),
    [rooms, activeRoomId]
  );

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  const upsertRoomWithMessagePreview = useCallback((roomId, message) => {
    setRooms((prev) => {
      const roomIndex = prev.findIndex((room) => room._id === roomId);
      if (roomIndex === -1) return prev;

      const currentRoom = prev[roomIndex];
      const updatedRoom = {
        ...currentRoom,
        lastMessage: {
          _id: message._id,
          text: message.text,
          sender: message.sender?._id || message.sender,
          createdAt: message.createdAt,
        },
        updatedAt: message.createdAt,
      };

      const next = [...prev];
      next.splice(roomIndex, 1);
      return [updatedRoom, ...next];
    });
  }, []);

  const fetchRooms = useCallback(async ({ silent = false } = {}) => {
    setLoadingRooms(true);
    try {
      const response = await axiosInstance.get(API_PATHS.MESSAGES.GET_ROOMS);
      if (!response.data.success) {
        if (!silent) {
          toast.error(response.data.message || "Failed to load rooms");
        }
        return;
      }
      setRooms(response.data.rooms || []);

      if (!activeRoomId && response.data.rooms?.length) {
        const nextRoom = searchParams.get("roomId") || response.data.rooms[0]._id;
        setActiveRoomId(nextRoom);
      }
    } catch {
      if (!silent) {
        toast.error("Failed to load chat rooms");
      }
    } finally {
      setLoadingRooms(false);
    }
  }, [activeRoomId, searchParams]);

  const pingPresence = useCallback(async () => {
    try {
      await axiosInstance.post(API_PATHS.USERS.PING_PRESENCE);
    } catch {
      // Ignore errors from presence ping
    }
  }, []);

  const applyPresenceUpdate = useCallback((payload = {}) => {
    const targetUserId = String(payload.userId || "");
    if (!targetUserId) return;

    const isOnline = Boolean(payload.isOnline);
    const lastSeenAt = payload.lastSeenAt || null;

    setRooms((prev) =>
      prev.map((room) => {
        if (String(room?.otherParticipant?._id || "") !== targetUserId) {
          return room;
        }

        return {
          ...room,
          otherParticipant: {
            ...room.otherParticipant,
            isOnline,
            lastSeenAt,
          },
        };
      }),
    );

    setPeopleResults((prev) =>
      prev.map((person) =>
        String(person?._id || "") === targetUserId
          ? {
              ...person,
              isOnline,
              lastSeenAt,
            }
          : person,
      ),
    );
  }, []);

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
    const token = getStoredAuthToken();
    if (!token || !userId) return;

    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token,
      },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("presence:state", (payload = {}) => {
      const onlineUserIds = new Set(
        (payload.onlineUserIds || []).map((id) => String(id)),
      );

      setRooms((prev) =>
        prev.map((room) => {
          const otherId = String(room?.otherParticipant?._id || "");
          if (!otherId) return room;

          return {
            ...room,
            otherParticipant: {
              ...room.otherParticipant,
              isOnline: onlineUserIds.has(otherId),
            },
          };
        }),
      );

      setPeopleResults((prev) =>
        prev.map((person) => ({
          ...person,
          isOnline: onlineUserIds.has(String(person?._id || "")),
        })),
      );
    });

    socket.on("presence:online", applyPresenceUpdate);
    socket.on("presence:offline", applyPresenceUpdate);

    socket.on("message:new", (payload = {}) => {
      const roomId = String(payload.roomId || "");
      const incomingMessage = payload.message;
      if (!roomId || !incomingMessage?._id) return;

      upsertRoomWithMessagePreview(roomId, incomingMessage);

      const isActiveRoom = roomId === String(activeRoomIdRef.current || "");
      if (!isActiveRoom) return;

      setMessages((prev) => {
        const exists = prev.some(
          (item) => String(item._id) === String(incomingMessage._id),
        );
        if (exists) return prev;
        return [...prev, incomingMessage];
      });
    });

    const socketPingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("presence:ping");
      }
    }, 20000);

    const fallbackInterval = setInterval(() => {
      pingPresence();
      fetchRooms({ silent: true });
    }, 120000);

    return () => {
      clearInterval(socketPingInterval);
      clearInterval(fallbackInterval);
      socket.off("presence:state");
      socket.off("presence:online", applyPresenceUpdate);
      socket.off("presence:offline", applyPresenceUpdate);
      socket.off("message:new");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    applyPresenceUpdate,
    fetchRooms,
    pingPresence,
    upsertRoomWithMessagePreview,
    userId,
  ]);

  useEffect(() => {
    if (!activeRoomId) return;
    setSearchParams({ roomId: activeRoomId });
    fetchMessages(activeRoomId);
  }, [activeRoomId, setSearchParams]);

  useEffect(() => {
    const trimmedQuery = peopleQuery.trim();

    if (!trimmedQuery) {
      setPeopleResults([]);
      setPeopleLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setPeopleLoading(true);
      try {
        const response = await axiosInstance.get(API_PATHS.USERS.SEARCH, {
          params: { query: trimmedQuery, limit: 10 },
          signal: controller.signal,
        });

        if (!response.data?.success) {
          setPeopleResults([]);
          return;
        }

        setPeopleResults(response.data.users || []);
      } catch (error) {
        if (error?.name !== "CanceledError" && error?.name !== "AbortError") {
          setPeopleResults([]);
        }
      } finally {
        setPeopleLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [peopleQuery]);

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

      upsertRoomWithMessagePreview(activeRoomId, newMessage);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleConnectUser = async (participantId) => {
    if (!participantId) return;

    setConnectingUserId(participantId);
    try {
      const response = await axiosInstance.post(API_PATHS.MESSAGES.CREATE_OR_GET_ROOM, {
        participantId,
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to connect with user");
        return;
      }

      const room = response.data.room;
      setRooms((prev) => {
        const exists = prev.some((item) => item._id === room._id);
        if (exists) {
          return prev.map((item) => (item._id === room._id ? room : item));
        }
        return [room, ...prev];
      });

      setActiveRoomId(room._id);
      setPeopleQuery("");
      setPeopleResults([]);
      toast.success("Connected! You can start messaging now.");
    } catch {
      toast.error("Failed to connect with user");
    } finally {
      setConnectingUserId("");
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

                <div className="space-y-2">
                  <label className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Search people to connect
                  </label>
                  <div className="relative">
                    <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
                    <input
                      type="text"
                      value={peopleQuery}
                      onChange={(event) => setPeopleQuery(event.target.value)}
                      placeholder="Search by name or email"
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border ${
                        isDark
                          ? "border-slate-600 bg-slate-800 text-slate-100"
                          : "border-gray-200 bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  {peopleLoading ? (
                    <div className={`text-xs flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
                    </div>
                  ) : peopleQuery.trim() ? (
                    <div className={`max-h-52 overflow-y-auto rounded-xl border ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                      {peopleResults.length === 0 ? (
                        <p className={`px-3 py-2 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                          No users found.
                        </p>
                      ) : (
                        peopleResults.map((person) => (
                          <div
                            key={person._id}
                            className={`px-3 py-2 border-b last:border-b-0 flex items-center justify-between gap-2 ${isDark ? "border-slate-700" : "border-gray-100"}`}
                          >
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                                {person.name}
                              </p>
                              <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                {person.email}
                              </p>
                              <p className={`text-[11px] mt-0.5 ${person.isOnline ? "text-emerald-500" : isDark ? "text-slate-500" : "text-gray-400"}`}>
                                {person.isOnline ? "Online" : formatLastSeen(person.lastSeenAt)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleConnectUser(person._id)}
                              disabled={connectingUserId === person._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {connectingUserId === person._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <UserPlus className="h-3.5 w-3.5" />
                              )}
                              Connect
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
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
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                          {room.otherParticipant?.name || "Unknown user"}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-[11px] ${room.otherParticipant?.isOnline ? "text-emerald-500" : isDark ? "text-slate-500" : "text-gray-400"}`}>
                          <span className={`h-2 w-2 rounded-full ${room.otherParticipant?.isOnline ? "bg-emerald-500" : isDark ? "bg-slate-500" : "bg-gray-400"}`} />
                          {room.otherParticipant?.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
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
                <div className="flex items-center justify-between gap-3">
                  <h3 className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {activeRoom ? activeRoom.otherParticipant?.name : "Select a conversation"}
                  </h3>
                  {activeRoom?.otherParticipant ? (
                    <span className={`text-xs ${activeRoom.otherParticipant?.isOnline ? "text-emerald-500" : isDark ? "text-slate-400" : "text-gray-500"}`}>
                      {activeRoom.otherParticipant?.isOnline
                        ? "Online"
                        : formatLastSeen(activeRoom.otherParticipant?.lastSeenAt)}
                    </span>
                  ) : null}
                </div>
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
