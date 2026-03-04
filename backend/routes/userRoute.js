import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getAllUser, updateProfile, getPublicProfile, deleteResume } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getAllUser);
userRouter.put("/update-profile", userAuth, updateProfile);
userRouter.delete("/delete-resume", userAuth, deleteResume);
userRouter.get("/:id", userAuth, getPublicProfile);

export default userRouter;
