import { Router } from "express";
import userControllers from "./userControllers.js";

const router = Router();
router.post("/register", userControllers.register.bind(userControllers));
router.post("/verify-otp", userControllers.verifyOTP.bind(userControllers));
router.post("/login", userControllers.login.bind(userControllers));
export default router;