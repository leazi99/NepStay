import express from "express";
import userAuth from "../middleware/userAuth.js";
import { get } from "mongoose";
import { getAllUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getAllUser);

export default userRouter;
