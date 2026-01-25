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
    role: UserRole;
    avatar_url: string;
}
const UserDB = {
    async createTable(info: UserInfo) {
        const query = `insert into users (first_name, last_name, email, password_hash, role, avatar_url) values ($1, $2, $3, $4, $5, $6) returning *`;
        const values = [info.first_name, info.last_name, info.email, info.password_hash, info.role, info.avatar_url];
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.log(err);
            
            throw new Error('Failed to create user');
        }
    },
    async findByEmail(email: string) {
        const query = `select * from users where email = $1`;
        const values = [email];
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw  new Error('User not found');}
    },

    async findById(id: number) {
        const query = `SELECT id, first_name, last_name, email, role, avatar_url, is_active, created_at, updated_at FROM users where id = $1`;
        const values = [id];
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw  new Error('User not found');
        }
    },

    async getAllUsers() {
        const query = `SELECT id, first_name, last_name, email, role, avatar_url, is_active, created_at, updated_at FROM users`;
        try {
            const result = await db.query(query);
            return result.rows;
        } catch (err) {
            throw new Error('Failed to get all users');
        }
    },
    async deleteById(id: number) {
        const query = `delete from users where id = $1 returning *`;
        const values = [id];
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw new Error('Failed to delete user');
        }

    }
}

export default UserDB;