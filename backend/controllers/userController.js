import userModel from "../models/userModel.js";

export const getAllUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
    res.json({
      success: true,
      getAllUser: {
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {name,avatar,companyName,companyDescription,companyLogo,resume}=req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;
    user.email = req.body.email || user.email;
    user.resume = req.body.resume || user.resume;
    if (user.role === "Client") {
      user.companyName = req.body.companyName || user.companyName;
      user.companyDescription =
        req.body.companyDescription || user.companyDescription;

      user.companyLogo = req.body.companyLogo || user.companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,

      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.messsage,
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    const fileName = resumeUrl?.split("/")?.pop();

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.role !== "jobseeker") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can delete resume",
      });
    }

    const filePath = path.join(__dirname, "../uploads", fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.resume = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
