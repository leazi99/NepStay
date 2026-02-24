import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {});
    console.log("MongoDb connected successfully");
  } catch (err) {
    console.error("MongoDb connection failed", err);
    process.exit(1);
  }
};

export default connectDB;
