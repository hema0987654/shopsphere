import db from "../../configs/DB.js";
export interface ProductsInfo {
    title: string;
    description: string;
    price: number;
    stock: number
    image_url?: string | null;
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
    async findByIdForUpdate(client: any, id: number) {
        const query = `SELECT * FROM products WHERE id = $1 FOR UPDATE`;
        const values = [id];
        const result = await client.query(query, values);
        return result.rows[0] ?? null;
    },

    async updateProduct(id: number, info: Partial<ProductsInfo>, client?: any) {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        const runner = client ?? db;

        const addField = (column: string, value: unknown) => {
            fields.push(`${column} = $${index}`);
            values.push(value);
            index++;
        };

        if (info.title !== undefined) addField("title", info.title);
        if (info.description !== undefined) addField("description", info.description);
        if (info.price !== undefined) addField("price", info.price);
        if (info.stock !== undefined) addField("stock", info.stock);
        if (info.image_url !== undefined) addField("image_url", info.image_url);

        if (fields.length === 0) return null;
        values.push(id);
        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await runner.query(query, values);
        return result.rows[0] ?? null;
    },
    async updateStock(client: any,id: number, stock: number) {
        const query = `UPDATE products SET stock = $1 WHERE id = $2 RETURNING *`;
        const values = [stock, id];
        const result = await client.query(query, values);
        return result.rows[0] ?? null;
    }
    ,
    async getLowStockProducts(threshold: number) {
        const query = `SELECT * FROM products WHERE stock <= $1 ORDER BY stock ASC, id ASC`;
        const result = await db.query(query, [threshold]);
        return result.rows;
    },
    async deleteById(id: number) {
        const query = `DELETE FROM products WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [id]);
        return result.rows[0] ?? null;
    }
}

export default productdb;
