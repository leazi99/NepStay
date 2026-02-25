import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import path from "path";
import jobRoutes from "./routes/authRoutes.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

connectDB();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("KaamSathi backend is running"));

app.use("/api/auth", authRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/jobs",jobRoutes);
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
