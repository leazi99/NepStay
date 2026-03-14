import mongoose from "mongoose";

const connectDB = async () => {
  const dbUrl = process.env.MONGODB_URL_DIRECT || process.env.MONGODB_URL;

  if (!dbUrl) {
    console.error("MongoDb connection failed: MONGODB_URL is not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log("MongoDb connected successfully");
  } catch (err) {
    console.error("MongoDb connection failed", err);
    process.exit(1);
  }
};

export default connectDB;
