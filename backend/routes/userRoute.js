// import express from "express";
// import userAuth from "../middleware/userAuth.js";
// import { get } from "mongoose";
// import { getAllUser } from "../controllers/userController.js";

// const userRouter = express.Router();

// userRouter.get("/data", userAuth, getAllUser);

// export default userRouter;

import express from "express";
import userAuth from "../middleware/userAuth.js";
import { get } from "mongoose";
import { getAllUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getAllUser);
userRouter.put("/update-profile", userAuth, async (req, res) => {
  try {
    const user = await get(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const { name, email, avatar } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    await user.save();
    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});
userRouter.post("/resume", userAuth, async (req, res) => {
  try {
    const user = await get(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const { resume } = req.body;
    if (resume) user.resume = resume;
    await user.save();
    return res.json({
      success: true,
      message: "Resume updated successfully",
      user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

userRouter.get("/:id", userAuth, async (req, res) => {
  try {
    const user = await get(req.params.id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    return res.json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});
export default userRouter;
