import { Router } from "express";
import userControllers from "./user.controller.js";
import { authenticateToken } from "../utils/middleware/auth.js";

const userRouter = Router();

userRouter.post("/register", userControllers.register);
userRouter.post("/verify-otp", userControllers.verifyOTP);
userRouter.post("/login", userControllers.login);
userRouter.patch("/:id", authenticateToken, userControllers.updateUserById);
userRouter.post("/forgetpass", userControllers.forgetpass);
userRouter.post("/verify-forgetpass", userControllers.verifyForgetPass);

export default userRouter;
