import { locationModel } from "../models/locationModel";

export const createLocation=async(req,res)=>{
  try{
    const {name,description}=req.body;
    const location=new locationModel({
      name,
      description
    }
  );
  await location.save();
  return res.json({
    success:true,
    message:"Location created successfully",
    location
  })
  } catch (error) {
    return res.json({
      success:false,
      message:error.message,
    })
}
}