import mongoose from "mongoose";
import config from "./constant.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
};

export default connectDB;
