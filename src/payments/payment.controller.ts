import AppError from "../utils/AppError.js";
import paymentService from "./payment.service.js";
import type { Request, Response } from "express";
import { MethodType } from "./data/payment.query.js";

class PaymentController {
    async payOrder(req: Request, res: Response) {
        const orderId = Number(req.params.orderId);
        if (Number.isNaN(orderId)) {
            throw new AppError("Invalid order ID", 400);
        }

        const userId = Number((req as any)?.user?.id);
        if (Number.isNaN(userId) || userId <= 0) {
            throw new AppError("Unauthorized", 401);
        }

        const method = (req.body as any)?.method as MethodType;
        const payment = await paymentService.payOrder({ userId, orderId, method });
        return res.status(200).json({ success: true, data: payment });
    }
}

export default new PaymentController();
