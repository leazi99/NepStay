import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
// import userRouter from "./routes/userRoute.js";
// import proposalRoutes from "./routes/proposalRoutes.js";
const app = express();
const port = process.env.PORT || 4000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());
connectDB();
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  }),
);

app.get("/", (req, res) => res.send("KaamSathi backend is running"));

app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);
// app.use("/api/proposals", proposalRoutes);
app.listen(port, () => console.log(`Server is running on port ${port}`));
