import "dotenv/config";
import express from "express";
import http from "node:http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import connectDB from "./config/mongodb.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import path from "node:path";
// Job portal routes - commented out for hotel booking system
// import jobRoutes from "./routes/jobRoutes.js";
// import applicationRoutes from "./routes/applicationRoutes.js";
// import savedJobsRoutes from "./routes/savedJobsRoutes.js";
// import proposalRoutes from "./routes/proposalRoutes.js";
// import analyticsRoutes from "./routes/analyticsRoutes.js";

// Hotel booking system routes
import hotelRoutes from "./routes/hotelRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import favoriteRoomsRoutes from "./routes/favoriteRoomsRoutes.js";
import hotelAnalyticsRoutes from "./routes/hotelAnalyticsRoutes.js";
import userRoutes from "./routes/userRoute.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userModel from "./models/userModel.js";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
app.set("trust proxy", 1);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];
const envOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length ? envOrigins : defaultAllowedOrigins;
const isProduction = process.env.NODE_ENV === "production";
const ONLINE_WINDOW_MS = 90 * 1000;

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

const onlineSocketCounts = new Map();

const addOnlineSocket = (userId) => {
  const current = onlineSocketCounts.get(userId) || 0;
  onlineSocketCounts.set(userId, current + 1);
  return current + 1;
};

const removeOnlineSocket = (userId) => {
  const current = onlineSocketCounts.get(userId) || 0;
  if (current <= 1) {
    onlineSocketCounts.delete(userId);
    return 0;
  }

  onlineSocketCounts.set(userId, current - 1);
  return current - 1;
};

const extractSocketToken = (socket) => {
  const authToken = String(socket.handshake?.auth?.token || "").trim();
  if (authToken) return authToken;

  const authorizationHeader = String(
    socket.handshake?.headers?.authorization || "",
  ).trim();

  if (authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  return "";
};

io.use(async (socket, next) => {
  try {
    const token = extractSocketToken(socket);
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("_id");
    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.userId = String(user._id);
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.userId;
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  socket.join(`user:${userId}`);
  const connectionCount = addOnlineSocket(userId);

  try {
    await userModel.findByIdAndUpdate(userId, {
      $set: { lastSeenAt: new Date() },
    });
  } catch (error) {
    console.error("Failed to update lastSeenAt on connect:", error);
  }

  if (connectionCount === 1) {
    io.emit("presence:online", {
      userId,
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
    });
  }

  socket.emit("presence:state", {
    onlineUserIds: Array.from(onlineSocketCounts.keys()),
  });

  socket.on("presence:ping", async () => {
    try {
      await userModel.findByIdAndUpdate(userId, {
        $set: { lastSeenAt: new Date() },
      });
    } catch (error) {
      console.error("Failed to update lastSeenAt on socket ping:", error);
    }
  });

  socket.on("disconnect", async () => {
    const remaining = removeOnlineSocket(userId);

    if (remaining === 0) {
      const now = new Date();
      try {
        await userModel.findByIdAndUpdate(userId, {
          $set: { lastSeenAt: now },
        });
      } catch (error) {
        console.error("Failed to update lastSeenAt on disconnect:", error);
      }

      io.emit("presence:offline", {
        userId,
        isOnline: false,
        lastSeenAt: now.toISOString(),
      });
    }
  });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests. Please try again later.",
  },
});

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS not allowed for this origin"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProduction ? undefined : false,
  }),
);

connectDB();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("KaamSathi backend is running"));
app.get("/health", (req, res) =>
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
);
app.get("/ready", (req, res) =>
  res.status(200).json({
    success: true,
    status: "ready",
    timestamp: new Date().toISOString(),
  }),
);

app.use("/api/auth", authLimiter);
app.use("/api/auth", authRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Job portal routes - commented out for hotel booking system
// app.use("/api/jobs", jobRoutes);
// app.use("/api/applications", applicationRoutes);
// app.use("/api/save-jobs", savedJobsRoutes);
// app.use("/api/proposals", proposalRoutes);
// app.use("/api/analytics", analyticsRoutes);

// Hotel booking system routes
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/favorite-rooms", favoriteRoomsRoutes);
app.use("/api/hotel-analytics", hotelAnalyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  if (error?.message?.includes("CORS not allowed")) {
    return res.status(403).json({
      success: false,
      message: "CORS blocked for this origin",
    });
  }

  console.error("Unhandled server error:", error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const port = process.env.PORT || 4001;
httpServer.listen(port, () => console.log(`Server is running on port ${port}`));
