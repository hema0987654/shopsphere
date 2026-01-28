import db from "../../configs/DB.js";

export enum UserRole {
    Admin = 'admin',
    User = 'user'
}

export interface UserInfo {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role?: UserRole;
    avatar_url: string;
}

export interface UpdateUserDTO {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
}

const UserDB = {
    async createUser(info: UserInfo) {
        const query = `
            INSERT INTO users (first_name, last_name, email, password_hash, role, avatar_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [info.first_name, info.last_name, info.email, info.password_hash, info.role, info.avatar_url];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async findByEmail(email: string) {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await db.query(query, [email]);
        return result.rows[0] ?? null;
    },

    async findById(id: number) {
        const query = `
            SELECT id, first_name, last_name, email, role, avatar_url, is_active, created_at, updated_at
            FROM users
            WHERE id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] ?? null;
    },

    async getAllUsers() {
        const query = `
            SELECT id, first_name, last_name, email, role, avatar_url, is_active, created_at, updated_at
            FROM users WHERE role != 'admin'
        `;
        const result = await db.query(query);
        return result.rows;
    },

    async deleteById(id: number) {
        const query = `DELETE FROM users WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [id]);
        return result.rows[0] ?? null;
    },

    async deactivateUser(id: number) {
        const query = `UPDATE users SET is_active = false WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [id]);
        return result.rows[0] ?? null;
    },

    async updateUser(id: number, info: UpdateUserDTO) {
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
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0] ?? null;
    },

    async updatePassword(email: string, newPasswordHash: string) {
        const query = `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, first_name, last_name, email, role, avatar_url, is_active, created_at, updated_at`;
        const result = await db.query(query, [newPasswordHash, email]);
        return result.rows[0] ?? null;
    }
};

export default UserDB;
