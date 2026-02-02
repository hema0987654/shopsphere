import { create } from "node:domain";
import db from "../../configs/DB.js";

export enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    // CANCELLED = "cancelled" // لو عايز تضيفها لاحقاً
}

export interface Order {
    userId: number;
    totalAmount: number;
    status?: OrderStatus;
}
const OrderQueries = {
    async createOrder(client: any, user_id: number, total_price: number) {
        const query = `INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING *`;
        const values = [user_id, total_price, "pending"];
        const result = await client.query(query, values);
        return result.rows[0];
    },
    async getOrderById(orderId: number) {
        const query = `
  SELECT o.id AS order_id, o.user_id, o.total_price, o.status, o.created_at,
         oi.id AS order_item_id, oi.product_id, oi.quantity, oi.price
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  WHERE o.id = $1
`; const values = [orderId];
        const result = await db.query(query, values);
        return result.rows[0];
    },
    async updateOrderStatus(orderId: number, status: OrderStatus) {
        const query = `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`;
        const values = [status, orderId];
        const result = await db.query(query, values);
        return result.rows[0];
    },
    async deleteOrder(orderId: number) {
        const query = `DELETE FROM orders WHERE id = $1`;
        const values = [orderId];
        await db.query(query, values);
        return { message: "Order deleted successfully" };
    },
    async getOrdersByUserId(userId: number) {
        const query = `SELECT * FROM orders WHERE user_id = $1`;
        const values = [userId];
        const result = await db.query(query, values);
        return result.rows || null;
    },
    async createOrderItem(client: any, order_id: number, product_id: number, quantity: number, price: number) {
        const query = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [order_id, product_id, quantity, price];
        const result = await client.query(query, values);
        return result.rows[0];
    }
};


export default OrderQueries;