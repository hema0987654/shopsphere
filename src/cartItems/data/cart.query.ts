import db from "../../configs/DB.js";

const cartDb = {

    async createCart(userId: number , productId: number, quantity: number) {
        const query = `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *`;
        const values = [userId, productId, quantity];
        const result = await db.query(query, values);
        return result.rows[0] || null;
    },

    async getCartByUserId(userId: number) {
        const query = `SELECT * FROM cart_items WHERE user_id = $1`;
        const values = [userId];
        const result = await db.query(query, values);
        return result.rows;
    },
    async findCartItemById(cartId: number) {
        const query = `SELECT * FROM cart_items WHERE id = $1`;
        const values = [cartId];
        const result = await db.query(query, values);
        return result.rows[0] || null;
    },

    async updateCartItemQuantity(cartId: number, quantity: number) {
        const query = `UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *`;
        const values = [quantity, cartId];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async deleteCartItem(cartId: number) {
        const query = `DELETE FROM cart_items WHERE id = $1 RETURNING *`;
        const values = [cartId];
        const result = await db.query(query, values);
        return result.rows[0];
    },
    async clearCartByUserId(client: any, userId: number) {
        const query = `DELETE FROM cart_items WHERE user_id = $1`;
        const values = [userId];
        await client.query(query, values);
    }

};


export default cartDb;