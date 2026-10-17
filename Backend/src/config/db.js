import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongoUri);
    console.log(`✅ MongoDB connected successfully: ${connection.connection.host}`);
  } catch (error) {
    console.warn("⚠️  MongoDB connection warning:", error.message);
    console.warn("👉 Please ensure MongoDB is running locally on port 27017 or set MONGO_URI in .env.");
    console.warn("👉 The HTTP server will continue running for API health inspection.");
  }
};

export default connectDB;