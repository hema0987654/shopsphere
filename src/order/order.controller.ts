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

    const requester = (req as any)?.user;
    const requesterId = Number(requester?.id);
    if (Number.isNaN(requesterId) || requesterId <= 0) {
      throw new AppError("Unauthorized", 401);
    }

    const order = await orderService.getOrderById(orderId, { id: requesterId, role: requester?.role });
    res.status(200).json(order);
  }

  async updateOrderStatus(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      throw new AppError("Invalid order id", 400);
    }

    const { status } = req.body;
    const requester = (req as any)?.user;
    const requesterId = Number(requester?.id);
    if (Number.isNaN(requesterId) || requesterId <= 0) {
      throw new AppError("Unauthorized", 401);
    }

    const updatedOrder = await orderService.updateOrderStatus(orderId, status, { id: requesterId, role: requester?.role });
    res.status(200).json(updatedOrder);
  }

  async deleteOrder(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      throw new AppError("Invalid order id", 400);
    }

    const requester = (req as any)?.user;
    const requesterId = Number(requester?.id);
    if (Number.isNaN(requesterId) || requesterId <= 0) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await orderService.deleteOrder(orderId, { id: requesterId, role: requester?.role });
    res.status(200).json(result);
  }
}

export default new OrderController();
