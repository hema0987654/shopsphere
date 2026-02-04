import reviewQueries from "./data/review.query.js";

class ReviewService {
    async createReview(review: { user_id: number; product_id: number; rating: number; comment?: string }) {
        return await reviewQueries.createReview(review);
    }

    async getReviewsByProductId(productId: number) {
        return await reviewQueries.getReviewsByProductId(productId);
    }

    async getAverageRatingByProductId(productId: number) {
        return await reviewQueries.getAverageRatingByProductId(productId);
    }

    async getReviewById(reviewId: number) {
        return await reviewQueries.getReviewById(reviewId);
    }

    async listReviews(options: { offset: number; limit: number; productId?: number; userId?: number }) {
        return await reviewQueries.listReviews(options);
    }

    async deleteReview(reviewId: number) {
        return await reviewQueries.deleteReview(reviewId);
    }
    async updateReview(reviewId: number, rating: number, comment?: string) {
        return await reviewQueries.updateReview(reviewId, rating, comment);
    }
    async getReviewStatistics(productId: number) {
        const reviews = await this.getReviewsByProductId(productId);
        const averageRating = await this.getAverageRatingByProductId(productId);
        const totalReviews = reviews.length;
        return {
            averageRating,
            totalReviews
        };
    }
}

export default new ReviewService();
