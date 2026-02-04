import paymentController from "./payment.controller.js";
import { authenticateToken, userOnly } from "../utils/middleware/auth.js";

import  { Router } from "express";
const paymentRouter = Router();

paymentRouter.post("/:orderId", authenticateToken, userOnly, paymentController.payOrder);

export default paymentRouter;
