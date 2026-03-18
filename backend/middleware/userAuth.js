import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const normalizeRole = (role) => {
  const value = String(role || "").toLowerCase();
  if (value === "client") return "employer";
  if (value === "freelancer") return "jobseeker";
  return value;
};

const userAuth = async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const token = req.cookies?.token || bearer;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Login again.",
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      const user = await userModel
        .findById(tokenDecode.id)
        .select("_id role email name isVerified");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = {
        ...tokenDecode,
        id: user._id,
        _id: user._id,
        role: normalizeRole(user.role),
        email: user.email,
      };
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
};

export default userAuth;
