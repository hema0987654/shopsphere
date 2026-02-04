import type { Request, Response } from "express";
import AppError from "../utils/AppError.js";
import reviewService from "./review.service.js";

class ReviewController {
    async createReview(req: Request, res: Response) {
        const userId = req.user?.id;
        const productId = Number(req.body.product_id);
        const rating = Number(req.body.rating);
        const comment = req.body.comment;

        if (!userId || isNaN(Number(userId))) {
            throw new AppError("Unauthorized", 401);
        }
        if (isNaN(productId)) {
            throw new AppError("Invalid product id", 400);
        }
        if (isNaN(rating)) {
            throw new AppError("Invalid rating", 400);
        }

        const review = await reviewService.createReview({
            user_id: Number(userId),
            product_id: productId,
            rating,
            comment
        });
        return res.status(201).json(review);
    }

    async getReviewsByProductId(req: Request, res: Response) {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            throw new AppError("Invalid product id", 400);
        }
        const reviews = await reviewService.getReviewsByProductId(productId);
        return res.status(200).json(reviews);
    }

    async getAverageRatingByProductId(req: Request, res: Response) {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            throw new AppError("Invalid product id", 400);
        }
        const averageRating = await reviewService.getAverageRatingByProductId(productId);
        return res.status(200).json({ averageRating });
    }

    async getReviewStatistics(req: Request, res: Response) {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            throw new AppError("Invalid product id", 400);
        }
        const stats = await reviewService.getReviewStatistics(productId);
        return res.status(200).json(stats);
    }

    async updateReview(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId || isNaN(Number(userId))) {
            throw new AppError("Unauthorized", 401);
        }
        const reviewId = Number(req.params.reviewId);
        if (isNaN(reviewId)) {
            throw new AppError("Invalid review id", 400);
        }
        const rating = Number(req.body.rating);
        const comment = req.body.comment;
        if (isNaN(rating)) {
            throw new AppError("Invalid rating", 400);
        }

        const existing = await reviewService.getReviewById(reviewId);
        if (!existing) {
            throw new AppError("Review not found", 404);
        }
        if (Number((existing as any)?.user_id) !== Number(userId)) {
            throw new AppError("Unauthorized to update this review", 403);
        }

        const review = await reviewService.updateReview(reviewId, rating, comment);
        if (!review) {
            throw new AppError("Review not found", 404);
        }
        return res.status(200).json(review);
    }

    async deleteReview(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId || isNaN(Number(userId))) {
            throw new AppError("Unauthorized", 401);
        }
        const reviewId = Number(req.params.reviewId);
        if (isNaN(reviewId)) {
            throw new AppError("Invalid review id", 400);
        }

        const existing = await reviewService.getReviewById(reviewId);
        if (!existing) {
            throw new AppError("Review not found", 404);
        }
        if (Number((existing as any)?.user_id) !== Number(userId)) {
            throw new AppError("Unauthorized to delete this review", 403);
        }

        const result = await reviewService.deleteReview(reviewId);
        if (!result) {
            throw new AppError("Review not found", 404);
        }
        return res.status(200).json(result);
    }
}

export default new ReviewController();
