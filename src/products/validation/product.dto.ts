import AppError from "../../utils/AppError.js";
import type { ProductsInfo } from "../data/products.query.js";

class ProductValidation {
    private requireString(value: string, field: string) {
        if (!value || value.trim().length === 0) {
            throw new AppError(`${field} is required`, 400);
        }
    }

    private requirePositiveNumber(value: number, field: string) {
        if (value == null || Number.isNaN(value) || value <= 0) {
            throw new AppError(`${field} must be a positive number`, 400);
        }
    }

    private requireNonNegativeNumber(value: number, field: string) {
        if (value == null || Number.isNaN(value) || value < 0) {
            throw new AppError(`${field} must be a non-negative number`, 400);
        }
    }

    private optionalNonEmptyString(value: unknown, field: string) {
        if (value === undefined || value === null) return;
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new AppError(`${field} must be a non-empty string`, 400);
        }
    }

    async validateCreate(info: ProductsInfo) {
        this.requireString(info.title, "title");
        this.requireString(info.description, "description");
        this.requirePositiveNumber(info.price, "price");
        this.requireNonNegativeNumber(info.stock, "stock");
        this.optionalNonEmptyString(info.image_url, "image_url");
    }

    async validateUpdate(info: Partial<ProductsInfo>) {
        if (info.title !== undefined) this.requireString(info.title, "title");
        if (info.description !== undefined) this.requireString(info.description, "description");
        if (info.price !== undefined) this.requirePositiveNumber(info.price, "price");
        if (info.stock !== undefined) this.requireNonNegativeNumber(info.stock, "stock");
        this.optionalNonEmptyString(info.image_url, "image_url");
    }
}

export default new ProductValidation();
