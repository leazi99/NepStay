import companyModel from "../models/companyModel";

export const company = async (req, res) => {
  const { name, location, website } = req.body;
  if (!name || !location) {
    return res.json({
      success: false,
      message: "Name and Location are required",
    });
  }
  try {
    const existingCompany = await companyModel.findOne({ name });
    if (existingCompany) {
      return res.json({
        success: false,
        messagee: "Company with this name already exists",
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCompanies=async(req,res)=>{
  try{
    const companies=await companyModel.find({req.params._id})
    return res.json({
      success:true,
      message:"Companies fetched successfully",
    })
  }catch(error){
    res.json({
      success: false,
      message: error.message,
    });
  }
}


export const getCompanyById=async(req,res)=>{
  try{
    const company=await companyModel.findById(req.params._id)
    return res.json({
      
    })
  }
}