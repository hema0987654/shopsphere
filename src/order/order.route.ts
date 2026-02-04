import orderController from "./order.controller.js";
import { adminOnly, authenticateToken,userOnly } from "../utils/middleware/auth.js";
import { Router } from "express";
const orderRouter = Router();
orderRouter.post("/", authenticateToken, userOnly, orderController.createOrder);
orderRouter.get("/:id", authenticateToken, orderController.getOrderById);
orderRouter.patch("/:id", authenticateToken, adminOnly, orderController.updateOrderStatus);
orderRouter.delete("/:id", authenticateToken, adminOnly, orderController.deleteOrder);

export default orderRouter;
