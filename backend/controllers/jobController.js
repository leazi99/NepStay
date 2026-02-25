import userModel from "../models/userModel.js";
import jobModel from "../models/jobModel.js";
import applicationModel from "../models/applicationModel.js";
import savedModel from "../models/savedModel.js";
export const createJob = async (req, res) => {
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

export const getJobs=async(req,res)=>{

}

export const getJobsEmployer=async(req,res)=>{

}

export const getJobById=async(req,res)=>{

}

export const updateJob=async(req,res)=>{

}

export const deleteJob=async(req,res)=>{

}

export const toggleClosJob=async(req,res)=>{
  
}