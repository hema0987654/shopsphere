import db from "../../configs/DB.js";

export enum PaymentStatus {
    pending = 'pending',
    success = 'success',
    failed = 'failed'
}

export enum MethodType {
    card = 'card',
    cash = 'cash',
    other = 'other'
}
export interface Payment {
  order_id: number;
  status: PaymentStatus;
  method: MethodType | null;
  amount: number;
}

const PaymentQueries = {
    async createPayment(client: any, payment: Payment): Promise<Payment> {
        const values = [payment.order_id, payment.status, payment.method, payment.amount];
        const query = `INSERT INTO payments (order_id, status, method, amount) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await client.query(query, values);
        return result.rows[0];
    },
    async getPaymentByOrderId(orderId: number, client?: any): Promise<Payment | null> {
        const runner = client ?? db;
        const query = `SELECT * FROM payments WHERE order_id = $1`;
        const result = await runner.query(query, [orderId]);
        return result.rows[0] || null;
    },

    async getPaymentByOrderIdForUpdate(client: any, orderId: number): Promise<Payment | null> {
        const query = `SELECT * FROM payments WHERE order_id = $1 FOR UPDATE`;
        const result = await client.query(query, [orderId]);
        return result.rows[0] || null;
    },

    async updatePaymentStatus(orderId: number, status: PaymentStatus, method: MethodType, client?: any): Promise<Payment | null> {
        const runner = client ?? db;
        const query = `UPDATE payments SET status = $1, method = $2 WHERE order_id = $3 RETURNING *`;
        const result = await runner.query(query, [status, method, orderId]);
        return result.rows[0] || null;
    }
    ,
    async deletePayment(orderId:number): Promise<boolean> {
        const query = `DELETE FROM payments WHERE order_id = $1`;
        const result = await db.query(query, [orderId]);
        return (result.rowCount ?? 0) > 0;
    }  
};

export default PaymentQueries;
