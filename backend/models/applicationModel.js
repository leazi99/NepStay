import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    // schema details
}, { timestamps: true });

const applicationModel = mongoose.models.Application || mongoose.model("Application", applicationSchema);
export default applicationModel;
