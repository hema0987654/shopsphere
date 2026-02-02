import AppError from "../utils/AppError.js";
import categorieService from "./categorie.service.js";
import type { Request, Response } from "express";

class CategoryController {


    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await categorieService.getAllCategories();
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCategoryById(req: Request, res: Response) {
            const idParam = req.params.id;
            if (typeof idParam !== "string") {
                throw new AppError("Invalid category ID", 400);
            }
            const category = await categorieService.getCategoryById(parseInt(idParam));
            res.status(200).json(category);
    }

}

export default new CategoryController();