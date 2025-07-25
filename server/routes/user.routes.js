import express from "express";
import {
  getUserDetails,
  githubLogin,
  googleLogin,
  loginUser,
  logoutAllDevices,
  logOutUser,
  registerUser,
  sendOTP,
  verifyOTP,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authLimiter } from "../rate-limiter/index.js";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("Hello User");
});
userRouter.post("/register",authLimiter, registerUser);
userRouter.post("/login",authLimiter, loginUser);
userRouter.post("/logOut", logOutUser);
userRouter.post("/logoutAll-device", logoutAllDevices);
userRouter.get("/profile", authMiddleware, getUserDetails);
userRouter.post("/google-auth", googleLogin);
userRouter.post("/github-auth", githubLogin);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);
export default userRouter;
