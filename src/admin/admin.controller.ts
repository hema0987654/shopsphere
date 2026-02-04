import userService from "../auth/user.service.js";
import categorieService from "../categories/categorie.service.js";
import productsService from "../products/products.service.js";

import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import AppError from "../utils/AppError.js";
import { toPublicUrl, withPublicProductImageUrl, withPublicProductImageUrls } from "../utils/publicUrl.js";
import reviewService from "../reviews/review.service.js";
import adminService from "./admin.service.js";

type UploadedFile = {
    filename: string;
    path?: string;
    mimetype?: string;
    originalname?: string;
    size?: number;
};

function parseOptionalDate(value: unknown, field: string) {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value !== "string") throw new AppError(`${field} must be a string`, 400);
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new AppError(`${field} is not a valid date`, 400);
    return parsed;
}

function tryExtractProductUploadFilename(imageUrl: string) {
    const match = imageUrl.match(/\/uploads\/products\/([^/?#]+)/i);
    return match?.[1] ?? null;
}

function tryDeleteProductUpload(filename: string) {
    const absolutePath = path.join(process.cwd(), "uploads", "products", filename);
    try {
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    } catch {
        // Best effort.
    }
}

class AdminController {

    async getUserById(req: Request, res: Response) {
        const id = req.params.id;
        if (typeof id === "undefined") {
            throw new AppError("User ID parameter is required.", 400);
        }
        const idParam = +id;
        if (isNaN(idParam)) {
            throw new AppError("User ID is not a number", 400);
        }
        const result = await userService.getUserById(idParam);
        return res.status(200).json(result);

    }
    async getAllUsers(req: Request, res: Response) {
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await userService.getUsersWithPagination(offset, limit);
        return res.status(200).json(result);
    }

    async deleteUserById(req: Request, res: Response) {
        const id = req.params.id;
        if (typeof id === "undefined") {
            throw new AppError("User ID parameter is required.", 400);
        }
        const idParam = +id;
        if (isNaN(idParam)) {
            throw new AppError("User ID is not a number", 400);
        }
        const result = await userService.deleteUserById(idParam);
        return res.status(200).json(result);
    }

    async createProduct(req: Request, res: Response) {
        const info = req.body;
        const newproduct = await productsService.create(info);
        res.status(201).json(withPublicProductImageUrl(req, newproduct));

    }

    async setUserActiveStatus(req: Request, res: Response) {
        const idParam = req.params.id;
        if (typeof idParam === "undefined") {
            throw new AppError("User ID parameter is required.", 400);
        }
        const id = Number(idParam);
        if (Number.isNaN(id)) {
            throw new AppError("User ID is not a number", 400);
        }
        const isActive = (req.body as any)?.is_active;
        if (typeof isActive !== "boolean") {
            throw new AppError("is_active must be a boolean", 400);
        }
        const result = await userService.setUserActiveStatus(id, isActive);
        return res.status(200).json(result);
    }
    async updateProduct(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError('this is not number', 400);
        }
        const info = req.body;
        const updatedproduct = await productsService.update(id, info);
        return res.status(200).json(withPublicProductImageUrl(req, updatedproduct));
    }

    async deleteProduct(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError('this is not number', 400);
        }
        const deletedproduct = await productsService.delete(id);
        const imageUrl = (deletedproduct as any)?.image_url;
        if (typeof imageUrl === "string" && imageUrl.length > 0) {
            const filename = tryExtractProductUploadFilename(imageUrl);
            if (filename) tryDeleteProductUpload(filename);
        }
        return res.status(200).json(withPublicProductImageUrl(req, deletedproduct));

    }

    async getLowStockProducts(req: Request, res: Response) {
        const thresholdRaw = req.query.threshold as string | undefined;
        const threshold = thresholdRaw ? Number(thresholdRaw) : 10;
        if (Number.isNaN(threshold) || threshold < 0) {
            throw new AppError("Invalid threshold", 400);
        }
        const products = await productsService.getLowStock(threshold);
        return res.status(200).json(withPublicProductImageUrls(req, products));
    }

    async updateProductStock(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            throw new AppError("Invalid product id", 400);
        }

        const stockRaw = (req.body as any)?.stock;
        const deltaRaw = (req.body as any)?.delta;

        const hasStock = stockRaw !== undefined;
        const hasDelta = deltaRaw !== undefined;
        if (hasStock && hasDelta) {
            throw new AppError("Provide either stock or delta, not both", 400);
        }
        if (!hasStock && !hasDelta) {
            throw new AppError("Provide stock or delta", 400);
        }

        const updated = hasStock
            ? await productsService.setStock(id, Number(stockRaw))
            : await productsService.adjustStock(id, Number(deltaRaw));

        return res.status(200).json(withPublicProductImageUrl(req, updated));
    }

    async updateProductPrice(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            throw new AppError("Invalid product id", 400);
        }
        const price = Number((req.body as any)?.price);
        if (Number.isNaN(price)) {
            throw new AppError("Invalid price", 400);
        }
        const updated = await productsService.setPrice(id, price);
        return res.status(200).json(withPublicProductImageUrl(req, updated));
    }

    async bulkUpdateProducts(req: Request, res: Response) {
        const payload = req.body as any;
        const updates = Array.isArray(payload) ? payload : payload?.updates;
        if (!Array.isArray(updates)) {
            throw new AppError("updates must be an array (or { updates: [...] })", 400);
        }
        const result = await productsService.bulkUpdate(updates);
        return res.status(200).json(withPublicProductImageUrls(req, result));
    }

    async exportProductsCsv(req: Request, res: Response) {
        const products = await productsService.getAll();

        const escapeCsv = (value: unknown) => {
            const text = value === null || value === undefined ? "" : String(value);
            const escaped = text.replace(/"/g, '""');
            return `"${escaped}"`;
        };

        const headers = ["id", "title", "description", "price", "stock", "image_url"];
        const rows = products.map((p: any) =>
            [
                escapeCsv(p.id),
                escapeCsv(p.title),
                escapeCsv(p.description),
                escapeCsv(p.price),
                escapeCsv(p.stock),
                escapeCsv(p.image_url ?? "")
            ].join(",")
        );
        const csv = `${headers.join(",")}\n${rows.join("\n")}\n`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="products.csv"');
        return res.status(200).send(csv);
    }

    async listReviews(req: Request, res: Response) {
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;
        const productIdRaw = req.query.productId ? Number(req.query.productId) : undefined;
        const userIdRaw = req.query.userId ? Number(req.query.userId) : undefined;

        const options: { offset: number; limit: number; productId?: number; userId?: number } = { offset, limit };
        if (typeof productIdRaw === "number" && !Number.isNaN(productIdRaw)) options.productId = productIdRaw;
        if (typeof userIdRaw === "number" && !Number.isNaN(userIdRaw)) options.userId = userIdRaw;

        const reviews = await reviewService.listReviews(options);
        return res.status(200).json(reviews);
    }

    async deleteReviewById(req: Request, res: Response) {
        const reviewId = Number(req.params.id);
        if (Number.isNaN(reviewId)) {
            throw new AppError("Invalid review id", 400);
        }
        const deleted = await reviewService.deleteReview(reviewId);
        if (!deleted) {
            throw new AppError("Review not found", 404);
        }
        return res.status(200).json(deleted);
    }

    async getDashboardOverview(req: Request, res: Response) {
        const from = parseOptionalDate(req.query.from, "from");
        const to = parseOptionalDate(req.query.to, "to");
        const range: { from?: Date; to?: Date } = {};
        if (from) range.from = from;
        if (to) range.to = to;
        const overview = await adminService.getDashboardOverview(range);
        return res.status(200).json(overview);
    }

    async getBestSellers(req: Request, res: Response) {
        const from = parseOptionalDate(req.query.from, "from");
        const to = parseOptionalDate(req.query.to, "to");
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const range: { from?: Date; to?: Date } = {};
        if (from) range.from = from;
        if (to) range.to = to;
        const rows = await adminService.getBestSellers({ range, limit });
        return res.status(200).json(rows);
    }

    async getStaleProducts(req: Request, res: Response) {
        const days = req.query.days ? Number(req.query.days) : 30;
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const products = await adminService.getStaleProducts({ days, limit });
        return res.status(200).json(withPublicProductImageUrls(req, products));
    }

    async uploadProductImage(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError("this is not number", 400);
        }

        const file = (req as Request & { file?: UploadedFile }).file;
        if (!file) {
            throw new AppError("Product image is required (field name: image).", 400);
        }

        try {
            const existing = await productsService.getByid(id);
            const previousImageUrl = (existing as any)?.image_url;

            const relativeUrl = `/uploads/products/${file.filename}`;
            const updated = await productsService.update(id, { image_url: relativeUrl });

            if (typeof previousImageUrl === "string" && previousImageUrl.length > 0) {
                const filename = tryExtractProductUploadFilename(previousImageUrl);
                if (filename && filename !== file.filename) tryDeleteProductUpload(filename);
            }

            return res.status(200).json({
                ...(updated as any),
                image_url: toPublicUrl(req, (updated as any)?.image_url ?? relativeUrl)
            });
        } catch (err) {
            tryDeleteProductUpload(file.filename);
            throw err;
        }
    }

    async createCategory(req: Request, res: Response) {
        const { name, parentId, quantity } = req.body;
        const category = await categorieService.createCategory(name, parentId, quantity);
        res.status(201).json(category);
    }
    async updateCategory(req: Request, res: Response) {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            throw new AppError("Invalid category id", 400);
        }
        const { name } = req.body;
        const category = await categorieService.updateCategory(parseInt(idParam), name);
        res.status(200).json(category);
    }

    async deleteCategory(req: Request, res: Response) {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            throw new AppError("Invalid category id", 400);
        }
        const category = await categorieService.deleteCategory(parseInt(idParam));
        res.status(200).json(category);
    }
}


export default new AdminController();
