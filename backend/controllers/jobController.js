import userModel from "../models/userModel.js";

export const getJobbyId = async (req, res) => {
  try {
    const { Id } = req.Id;
    if (!Id) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
