import db from "../../configs/DB.js";

const categoryEntity = {

    async create(name: string, parentId: number | null = null, quantity: number) {
        const query = `
            INSERT INTO categories (name, parent_id)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await db.query(query, [name, parentId]);
        return result.rows[0];
    },

    async findAll() {
        const query = `
            SELECT c.*, p.name AS parent_name
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
        `;
        const result = await db.query(query);
        return result.rows;
    },

    async findById(id: number) {
        const result = await db.query(
            `SELECT * FROM categories WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    },

    async updateById(id: number, name: string) {
        const result = await db.query(
            `UPDATE categories
             SET name = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [name, id]
        );
        return result.rows[0];
    },

    async deleteById(id: number) {
        const result = await db.query(
            `DELETE FROM categories WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    },
    
};

export default categoryEntity;
