import DashboardDB, { type DateRange } from "./data/dashboard.query.js";
import AppError from "../utils/AppError.js";

class AdminService {
    async getDashboardOverview(range: DateRange) {
        const [overview, newUsers] = await Promise.all([
            DashboardDB.getOverview(range),
            DashboardDB.getNewUsersCount(range)
        ]);

        return {
            ...overview,
            new_users: newUsers
        };
    }

    async getBestSellers(options: { range: DateRange; limit: number }) {
        if (!Number.isFinite(options.limit) || options.limit < 1) {
            throw new AppError("limit must be a positive number", 400);
        }
        const limit = Math.min(100, Math.floor(options.limit));
        return await DashboardDB.getBestSellers({ range: options.range, limit });
    }

    async getStaleProducts(options: { days: number; limit: number }) {
        if (!Number.isFinite(options.days) || options.days < 1) {
            throw new AppError("days must be a positive number", 400);
        }
        if (!Number.isFinite(options.limit) || options.limit < 1) {
            throw new AppError("limit must be a positive number", 400);
        }
        const days = Math.min(3650, Math.floor(options.days));
        const limit = Math.min(100, Math.floor(options.limit));
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return await DashboardDB.getStaleProducts({ from, limit });
    }
}

export default new AdminService();
