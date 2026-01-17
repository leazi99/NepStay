import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget:{
      type:Number,
      required:true,
    },
    company: {
      type: String,
      required: true,
    },
    duration:{
      type:String,
      required:true,
    },
    client:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    },
    status:{
      type:String,
      enum:["pending","accepeted","rejected"],
      default:"pending",

    },
    createdAt:{
      type:Date,
      default:Date.now,
    },

  },
  { timestamps: true },
  {toJSON:{virtuals:true},
toObject:{virtuals:true}}
);

jobSchema.virtual("proposals",{
  ref:"Proposal",
  localField:"_id",
  foreignField:"job",
  justOne:false,
})
const jobModel = mongoose.models.job || mongoose.model("job", jobSchema);

export default jobModel;


