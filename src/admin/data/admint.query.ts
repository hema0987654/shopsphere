import db from "../../configs/DB.js";


const AdminDB = {
    async countUsers() {
        const query = `SELECT COUNT(*) AS user_count FROM users WHERE role != 'admin'`;
        const result = await db.query(query);
        return parseInt(result.rows[0].user_count, 10);
    }
};

export default AdminDB;
