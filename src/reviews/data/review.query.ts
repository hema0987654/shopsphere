import db from "../../configs/DB.js";
interface Reviewinfo {
    user_id: number;
    product_id: number;
    rating: number;
    comment?: string;
}
const reviewQueries = {

    async createReview(review: Reviewinfo) {
        const values = [review.user_id, review.product_id, review.rating, review.comment];
        const query = `INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0];
    },
    async getReviewsByProductId(productId: number) {
        const query = `SELECT * FROM reviews WHERE product_id = $1`;
        const result = await db.query(query, [productId]);
        return result.rows ;
    },
    async getAverageRatingByProductId(productId: number) {
        const query = `SELECT AVG(rating) as average_rating FROM reviews WHERE product_id = $1`;
        const result = await db.query(query, [productId]);
        const avg = result.rows[0].average_rating;
        return avg ? parseFloat(avg) : null;

    },

    async getReviewById(reviewId: number) {
        const query = `SELECT * FROM reviews WHERE id = $1`;
        const result = await db.query(query, [reviewId]);
        return result.rows[0] ?? null;
    },

    async listReviews(options: { offset: number; limit: number; productId?: number; userId?: number }) {
        const offset = Math.max(0, options.offset);
        const limit = Math.min(100, Math.max(1, options.limit));

        const where: string[] = [];
        const values: any[] = [];
        let index = 1;

        if (typeof options.productId === "number" && !Number.isNaN(options.productId)) {
            where.push(`product_id = $${index}`);
            values.push(options.productId);
            index++;
        }
        if (typeof options.userId === "number" && !Number.isNaN(options.userId)) {
            where.push(`user_id = $${index}`);
            values.push(options.userId);
            index++;
        }

        values.push(offset);
        const offsetIdx = index++;
        values.push(limit);
        const limitIdx = index++;

        const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
        const query = `
            SELECT *
            FROM reviews
            ${whereClause}
            ORDER BY id DESC
            OFFSET $${offsetIdx} LIMIT $${limitIdx}
        `;
        const result = await db.query(query, values);
        return result.rows;
    },

    async deleteReview(reviewId: number) {
        const query = `DELETE FROM reviews WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [reviewId]);
        return result.rows[0] ?? null;
    },

    async updateReview(reviewId: number, rating: number, comment?: string) {
        const values = [rating, comment, reviewId];
        const query = `
  UPDATE reviews 
  SET rating = $1, comment = COALESCE($2, comment) 
  WHERE id = $3 RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0];
    },

};

export default reviewQueries;
