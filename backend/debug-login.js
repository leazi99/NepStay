import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import userModel from "./models/userModel.js";

const testEmail = "ujjwalbasnet920@gmail.com";

async function debugLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find user
    const user = await userModel.findOne({
      email: { $regex: `^${testEmail}$`, $options: "i" },
    });

    if (!user) {
      console.log("❌ User not found with email:", testEmail);
      console.log("\n💡 Solution: Register a new account first");
      process.exit(0);
    }

    console.log("\n✅ User found:");
    console.log("- Email:", user.email);
    console.log("- Name:", user.name);
    console.log("- Role:", user.role);
    console.log("- Is Verified:", user.isVerified);
    console.log("- Account Created:", user.createdAt);

    if (!user.isVerified) {
      console.log("\n⚠️  EMAIL NOT VERIFIED!");
      console.log("💡 Solution: Verify your email before logging in");
      console.log("   Click 'Verify Email' on the login page");
    }

    // Test password
    const testPassword = "your-password-here"; // Replace with actual password
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log("\n✅ Password is correct");
    } else {
      console.log("\n❌ Password does not match");
      console.log("💡 Solution: Use 'Forgot password?' to reset your password");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

debugLogin();
