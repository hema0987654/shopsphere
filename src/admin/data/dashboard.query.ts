import db from "../../configs/DB.js";

export type DateRange = { from?: Date; to?: Date };

function buildDateWhereClause(column: string, range: DateRange) {
    const where: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (range.from) {
        where.push(`${column} >= $${index}`);
        values.push(range.from);
        index++;
    }
    if (range.to) {
        where.push(`${column} <= $${index}`);
        values.push(range.to);
        index++;
    }

    return {
        whereClause: where.length ? `WHERE ${where.join(" AND ")}` : "",
        values,
        nextIndex: index
    };
}

const DashboardDB = {
    async getOverview(range: DateRange) {
        const { whereClause, values } = buildDateWhereClause("created_at", range);
        const query = `
            SELECT
                COUNT(*)::int AS total_orders,
                COALESCE(SUM(total_price), 0)::float AS total_sales,
                COALESCE(AVG(total_price), 0)::float AS avg_order_value,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0)::int AS pending_orders,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0)::int AS paid_orders,
                COALESCE(SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END), 0)::int AS shipped_orders,
                COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0)::int AS delivered_orders
            FROM orders
            ${whereClause}
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async getNewUsersCount(range: DateRange) {
        const { whereClause, values } = buildDateWhereClause("created_at", range);
        const query = `
            SELECT COUNT(*)::int AS new_users
            FROM users
            ${whereClause ? `${whereClause} AND role != 'admin'` : "WHERE role != 'admin'"}
        `;
        const result = await db.query(query, values);
        return result.rows[0]?.new_users ?? 0;
    },

    async getBestSellers(options: { range: DateRange; limit: number }) {
        const { whereClause, values, nextIndex } = buildDateWhereClause("o.created_at", options.range);
        const limitIdx = nextIndex;
        values.push(options.limit);
        const query = `
            SELECT
                p.id,
                p.title,
                COALESCE(SUM(oi.quantity), 0)::int AS sold_quantity,
                COALESCE(SUM(oi.quantity * oi.price), 0)::float AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            ${whereClause}
            GROUP BY p.id, p.title
            ORDER BY sold_quantity DESC, revenue DESC, p.id ASC
            LIMIT $${limitIdx}
        `;
        const result = await db.query(query, values);
        return result.rows;
    },

    async getStaleProducts(options: { from: Date; limit: number }) {
        const query = `
            SELECT p.*
            FROM products p
            LEFT JOIN (
                SELECT oi.product_id, SUM(oi.quantity)::int AS sold_quantity
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.created_at >= $1
                GROUP BY oi.product_id
            ) s ON s.product_id = p.id
            WHERE COALESCE(s.sold_quantity, 0) = 0
            ORDER BY p.stock DESC, p.id DESC
            LIMIT $2
        `;
        const result = await db.query(query, [options.from, options.limit]);
        return result.rows;
    }
};

export default DashboardDB;

