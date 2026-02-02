import userService from "../auth/user.service.js";
import categorieService from "../categories/categorie.service.js";
import productsService from "../products/products.service.js";

import type { Request, Response } from "express";
import AppError from "../utils/AppError.js";

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
        res.status(201).json(newproduct);

    }
    async updateProduct(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError('this is not number', 400);
        }
        const info = req.body;
        const updatedproduct = await productsService.update(id, info);
        return res.status(200).json(updatedproduct);
    }

    async deleteProduct(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError('this is not number', 400);
        }
        const deletedproduct = await productsService.delete(id);
        return res.status(200).json(deletedproduct);

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