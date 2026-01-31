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
        try {
            const idParam = req.params.id;
            if (typeof idParam !== "string") {
                return res.status(400).json({ error: "Invalid category id" });
            }
            const category = await categorieService.getCategoryById(parseInt(idParam));
            res.status(200).json(category);
        } catch (error: any) {
            if (error.message === "Category not found") return res.status(404).json({ error: error.message });
            res.status(404).json({ error: error.message });
        }
    }

}

export default new CategoryController();