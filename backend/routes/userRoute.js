import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getAllUser,
  updateProfile,
  getPublicProfile,
  deleteResume,
  changePassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getAllUser);
userRouter.put("/update-profile", userAuth, updateProfile);
userRouter.put("/change-password", userAuth, changePassword);
userRouter.delete("/delete-resume", userAuth, deleteResume);
userRouter.get("/:id", userAuth, getPublicProfile);

export default userRouter;
