import reviewController from "./review.controller.js";
import { Router } from "express";
import { authenticateToken, userOnly } from "../utils/middleware/auth.js";

const reviewRouter = Router();

reviewRouter.post("/", authenticateToken, userOnly, reviewController.createReview);
reviewRouter.get("/product/:productId", reviewController.getReviewsByProductId);
reviewRouter.get("/product/:productId/average", reviewController.getAverageRatingByProductId);
reviewRouter.get("/product/:productId/stats", reviewController.getReviewStatistics);
reviewRouter.patch("/:reviewId", authenticateToken, userOnly, reviewController.updateReview);
reviewRouter.delete("/:reviewId", authenticateToken, userOnly, reviewController.deleteReview);

export default reviewRouter;
