import db from "../../configs/DB.js";
export interface ProductsInfo {
    title: string;
    description: string;
    price: number;
    stock: number
}
const productdb = {
    async createProduct(info: ProductsInfo) {
        const query = `INSERT INTO products (title,description,price,stock) VALUES ($1,$2,$3,$4) RETURNING *`;
        const values = [info.title, info.description, info.price, info.stock];
        const result = await db.query(query, values);
        return result.rows[0];
    },


    async getAllProduct() {
        const query = `SELECT * FROM products`;
        const result = await db.query(query);
        return result.rows;
    },

    async findById(id: number) {
        const query = `SELECT * FROM products WHERE id = $1`;
        const values = [id];
        const result = await db.query(query, values);
        return result.rows[0] ?? null;
    },

    async updateProduct(id: number, info: Partial<ProductsInfo>) {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;
        for (const key in info) {
            if ((info as any)[key] === undefined) continue;
            fields.push(`${key} = $${index}`);
            values.push((info as any)[key]);
            index++;
        }
        if (fields.length === 0) return null;
        values.push(id);
        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0] ?? null;
    },

    async deleteById(id: number) {
        const query = `DELETE FROM products WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [id]);
        return result.rows[0] ?? null;
    }
}

export default productdb;