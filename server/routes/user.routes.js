import express from "express";
import {
  getAllUsersController,
  getStorageUsage,
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

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("Hello User");
});
userRouter.get("/all", authMiddleware, getAllUsersController);
userRouter.get("/storage", authMiddleware, getStorageUsage);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logOut", logOutUser);
userRouter.post("/logoutAll-device", logoutAllDevices);
userRouter.get("/profile", authMiddleware, getUserDetails);
userRouter.post("/google-auth", googleLogin);
userRouter.post("/github-auth", githubLogin);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);
export default userRouter;
