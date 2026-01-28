import db from "../../configs/DB.js";
import type { UserRole } from "./user.entity.js";

export interface PendingUserInfo {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    avatar_url?: string;
    otp: string;
    otp_expires_at: Date;
}

const PendingUsersDB = {

    async createPendingUser(info: PendingUserInfo) {
        const query = `
            INSERT INTO pending_users
            (first_name, last_name, email, password_hash, role, avatar_url, otp, otp_expires_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id, email, created_at
        `;

        const values = [
            info.first_name,
            info.last_name,
            info.email,
            info.password_hash,
            info.role,
            info.avatar_url ?? null,
            info.otp,
            info.otp_expires_at
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    },

    async findPendingUserByEmail(email: string) {
        const query = `SELECT * FROM pending_users WHERE email = $1`;
        const result = await db.query(query, [email]);
        return result.rows[0] ?? null;
    },

    async deletePendingUserByEmail(email: string) {
        const query = `DELETE FROM pending_users WHERE email = $1 RETURNING *`;
        const result = await db.query(query, [email]);
        return result.rows[0] ?? null;
    },

    async updateOtp(email: string, otp: string, expiresAt: Date) {
        const query = `
            UPDATE pending_users
            SET otp = $1, otp_expires_at = $2
            WHERE email = $3
            RETURNING id, email
        `;
        const result = await db.query(query, [otp, expiresAt, email]);
        return result.rows[0] ?? null;
    }
};

export default PendingUsersDB;
