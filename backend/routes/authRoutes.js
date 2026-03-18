import express from "express";
import multer from "multer";
import {
  getSession,
  isAuthenticated,
  login,
  logout,
  refreshSession,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import upload from "../middleware/uploadMiddleware.js";
const authRouter = express.Router();

const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const resumeFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."),
      false,
    );
  }
};

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const verificationDocFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed."),
      false,
    );
  }
};

const verificationDocUpload = multer({
  storage: resumeStorage,
  fileFilter: verificationDocFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-otp", sendVerifyOtp);
authRouter.post("/verify-Account", verifyEmail);
authRouter.post("/isAuthenticated", userAuth, isAuthenticated);
authRouter.post("/session", userAuth, getSession);
authRouter.post("/refresh-session", userAuth, refreshSession);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

authRouter.post("/upload-image", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({
    success: true,
    message: "Image uploaded successfully",
    imageUrl,
  });
});

authRouter.post("/upload-resume", resumeUpload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No resume uploaded",
    });
  }

  const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  return res.json({
    success: true,
    message: "Resume uploaded successfully",
    resumeUrl,
  });
});

authRouter.post(
  "/upload-verification-doc",
  userAuth,
  verificationDocUpload.single("document"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded",
      });
    }

    const documentUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.json({
      success: true,
      message: "Verification document uploaded successfully",
      documentUrl,
    });
  },
);
export default authRouter;
