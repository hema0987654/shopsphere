import type { Request, Response } from "express";
import orderService from "./order.service.js";
import AppError from "../utils/AppError.js";

class OrderController {
  async createOrder(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const newOrder = await orderService.createOrder(userId);
    res.status(201).json(newOrder);
  }

  async getOrderById(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      throw new AppError("Invalid order id", 400);
    }

    const order = await orderService.getOrderById(orderId);
    res.status(200).json(order);
  }

  async updateOrderStatus(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      throw new AppError("Invalid order id", 400);
    }

    const { status } = req.body;
    const userId = req.user?.id;

    const updatedOrder = await orderService.updateOrderStatus(orderId, status, userId);
    res.status(200).json(updatedOrder);
  }

  async deleteOrder(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      throw new AppError("Invalid order id", 400);
    }

    const userId = req.user?.id;
    const result = await orderService.deleteOrder(orderId, userId);
    res.status(200).json(result);
  }
}

export default new OrderController();
