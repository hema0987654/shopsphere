import AppError from "../utils/AppError.js";
import PaymentQueries from "./data/payment.query.js";
import { MethodType, PaymentStatus } from "./data/payment.query.js";
import { PaymentGateway } from "../utils/payment.gateway.js";
import db from "../configs/DB.js";
import OrderQueries, { OrderStatus } from "../order/db/order.query.js";

class PaymentService {
    async payOrder(options: { userId: number; orderId: number; method: MethodType }) {
        const { userId, orderId, method } = options;

        if (!Number.isFinite(userId) || userId <= 0) {
            throw new AppError("Unauthorized", 401);
        }
        if (!Number.isFinite(orderId) || orderId <= 0) {
            throw new AppError("Invalid order ID.", 400);
        }
        if (!Object.values(MethodType).includes(method)) {
            throw new AppError("Invalid payment method.", 400);
        }

        const client = await db.connect();
        try {
            await client.query("BEGIN");

            const order = await OrderQueries.getOrderHeaderById(orderId, client);
            if (!order) throw new AppError("Order not found.", 404);
            if (order.user_id !== userId) throw new AppError("Unauthorized to pay this order.", 403);
            if (order.status !== OrderStatus.PENDING) throw new AppError("Only pending orders can be paid.", 400);

            const payment = await PaymentQueries.getPaymentByOrderIdForUpdate(client, orderId);
            if (!payment) throw new AppError("Payment record not found for the given order.", 404);
            if (payment.status === PaymentStatus.success) {
                throw new AppError("Payment has already been completed for this order.", 400);
            }
            const amount = Number((payment as any)?.amount);
            if (!Number.isFinite(amount) || amount <= 0) throw new AppError("Invalid payment amount.", 400);

            const success = await PaymentGateway.charge(amount, method);
            const nextStatus = success ? PaymentStatus.success : PaymentStatus.failed;

            const updatedPayment = await PaymentQueries.updatePaymentStatus(orderId, nextStatus, method, client);
            if (success) {
                await OrderQueries.updateOrderStatus(orderId, OrderStatus.PAID, client);
            }

            await client.query("COMMIT");
            return {
                payment: updatedPayment,
                message: success ? "Payment successful" : "Payment failed"
            };
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
}
export default new PaymentService();
