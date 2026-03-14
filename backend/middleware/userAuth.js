import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized.Login Again",
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      const user = await userModel
        .findById(tokenDecode.id)
        .select("_id role email name isVerified");

      if (!user) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }

      req.user = {
        ...tokenDecode,
        id: user._id,
        _id: user._id,
        role: user.role,
        email: user.email,
      };
    } else {
      return res.json({
        success: false,
        message: "Not Authorized.",
      });
    }
    next();
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default userAuth;
