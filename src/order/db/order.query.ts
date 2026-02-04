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

export type OrderItem = {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
};

export type OrderWithItems = {
    id: number;
    user_id: number;
    total_price: number;
    status: OrderStatus;
    created_at: any;
    updated_at?: any;
    items: OrderItem[];
};

export type OrderHeader = {
    id: number;
    user_id: number;
    total_price: number;
    status: OrderStatus;
    created_at: any;
    updated_at?: any;
};
const OrderQueries = {
    async createOrder(client: any, user_id: number, total_price: number) {
        const query = `INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING *`;
        const values = [user_id, total_price, "pending"];
        const result = await client.query(query, values);
        return result.rows[0];
    },

    async getOrderHeaderById(orderId: number, client?: any): Promise<OrderHeader | null> {
        const runner = client ?? db;
        const query = `SELECT id, user_id, total_price, status, created_at, updated_at FROM orders WHERE id = $1`;
        const values = [orderId];
        const result = await runner.query(query, values);
        return result.rows[0] ?? null;
    },

    async getOrderById(orderId: number): Promise<OrderWithItems | null> {
        const query = `
            SELECT
                o.id,
                o.user_id,
                o.total_price,
                o.status,
                o.created_at,
                o.updated_at,
                oi.id AS item_id,
                oi.product_id,
                oi.quantity,
                oi.price
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = $1
            ORDER BY oi.id ASC
        `;
        const values = [orderId];
        const result = await db.query(query, values);
        if (result.rows.length === 0) return null;

        const first = result.rows[0];
        const items: OrderItem[] = result.rows
            .filter((row: any) => row.item_id !== null && row.item_id !== undefined)
            .map((row: any) => ({
                id: row.item_id,
                product_id: row.product_id,
                quantity: row.quantity,
                price: row.price
            }));

        return {
            id: first.id,
            user_id: first.user_id,
            total_price: first.total_price,
            status: first.status,
            created_at: first.created_at,
            updated_at: first.updated_at,
            items
        } as OrderWithItems;
    },

    async updateOrderStatus(orderId: number, status: OrderStatus, client?: any) {
        const runner = client ?? db;
        const query = `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`;
        const values = [status, orderId];
        const result = await runner.query(query, values);
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
