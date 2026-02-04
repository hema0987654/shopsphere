import OrderQueries from "./db/order.query.js";
import cartDb from "../cartItems/data/cart.query.js";
import { OrderStatus } from "./db/order.query.js";
import AppError from "../utils/AppError.js";
import productdb from "../products/data/products.query.js";
import db from "../configs/DB.js";
import PaymentQueries, { PaymentStatus } from "../payments/data/payment.query.js";
class OrderService {
    async createOrder(user_id: number) {
        const client = await db.connect();

        try {
            await client.query("BEGIN"); 

            const cartItems = await cartDb.getCartByUserId(user_id);
            if (!cartItems || cartItems.length === 0) {
                throw new AppError("Cart is empty. Cannot create order.", 400);
            }

            let totalAmount = 0;
            const prductMap = new Map<number,any>();
            for (const item of cartItems) {
                const product = await productdb.findById(item.product_id);
                if (!product) throw new AppError(`Product with ID ${item.product_id} not found.`, 404);
                totalAmount += product.price * item.quantity;
                if (product.stock < item.quantity) {
                    throw new AppError(`Insufficient stock for product ID ${item.product_id}.`, 400);
                }
                prductMap.set(item.product_id, product);
            }

            const order = await OrderQueries.createOrder(client, user_id, totalAmount);
            await PaymentQueries.createPayment(client, {
                order_id: order.id,
                status: PaymentStatus.pending,
                method: null,
                amount: totalAmount
            });
            for (const item of cartItems) {
                const product = prductMap.get(item.product_id);
                const newStock = product.stock - item.quantity;
                await productdb.updateStock(client, item.product_id, newStock);
                await OrderQueries.createOrderItem(client, order.id, item.product_id, item.quantity, product.price);
            }
            

            await cartDb.clearCartByUserId(client, user_id);

            await client.query("COMMIT");
            return order;

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async getOrderById(orderId: number, requester?: { id: number; role?: string }) {
        const order = await OrderQueries.getOrderById(orderId);
        if (!order) {
            throw new AppError("Order not found.", 404);
        }
        if (requester?.role !== "admin" && requester?.id && order.user_id !== requester.id) {
            throw new AppError("Unauthorized to view this order.", 403);
        }
        return order;
    }
    async updateOrderStatus(orderId: number, status: string, requester?: { id: number; role?: string }) {
        if (requester?.role !== "admin") {
            throw new AppError("Forbidden", 403);
        }
        const order = await OrderQueries.getOrderHeaderById(orderId);

        if (!order) {
            throw new AppError("Order not found.", 404);
        }
        const validStatuses = Object.values(OrderStatus);
        if (!validStatuses.includes(status as any)) {
            throw new AppError("Invalid order status.", 400);
        }
        return await OrderQueries.updateOrderStatus(orderId, status as any);
    }
    async deleteOrder(orderId: number, requester?: { id: number; role?: string }) {
        if (requester?.role !== "admin") {
            throw new AppError("Forbidden", 403);
        }
        const order = await OrderQueries.getOrderHeaderById(orderId);
        if (!order) {
            throw new AppError("Order not found.", 404);
        }
        return await OrderQueries.deleteOrder(orderId);
    }
}

export default new OrderService();
