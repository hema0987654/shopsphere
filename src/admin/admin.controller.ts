import userService from "../auth/user.service.js";
import categorieService from "../categories/categorie.service.js";
import productsService from "../products/products.service.js";

import type { Request, Response } from "express";

class AdminController {

    //user management methods
        async getUserById(req: Request, res: Response) {
            try {
                const id = req.params.id;
                if (typeof id === "undefined") {
                    return res.status(400).json({ error: "User ID parameter is required." });
                }
                const idParam = +id;
                const result = await userService.getUserById(idParam);
                return res.status(200).json(result);
            } catch (err: any) {
                if (err.message === 'User not found') return res.status(404).json({ error: err.message });
                res.status(400).json({ error: err.message });
            }
        }
        async getAllUsers(req: Request, res: Response) {
            try {
                const offset = parseInt(req.query.offset as string) || 0;
                const limit = parseInt(req.query.limit as string) || 10;
                const result = await userService.getUsersWithPagination(offset, limit);
                return res.status(200).json(result);
            } catch (err: any) {
                res.status(400).json({ error: err.message });
            }
        }
        
        async deleteUserById(req: Request, res: Response) {
            try {
                const id = req.params.id;
                if (typeof id === "undefined") {
                    return res.status(400).json({ error: "User ID parameter is required." });
                }
                const idParam = +id;
                const result = await userService.deleteUserById(idParam);
                return res.status(200).json(result);
            } catch (err: any) {
                if (err.message === 'User not found') return res.status(404).json({ error: err.message });
                res.status(400).json({ error: err.message });
            }
        }
    
        //product management methods
            async createProduct(req:Request,res:Response){
                try {
                    const info = req.body;
                    const newproduct = await productsService.create(info);
                    res.status(201).json(newproduct);
                } catch (error:any) {
                    res.status(400).json({message:error.message});
                }
            }
                async updateProduct(req:Request,res:Response){
        try {
            const id = Number(req.params.id);
            const info = req.body;
            const updatedproduct = await productsService.update(id,info);
            return res.status(200).json(updatedproduct);
        } catch (error:any) {
            if (error.message === 'this is not number') return res.status(400).json({message:error.message});
            res.status(400).json({message:error.message});
        }
    }

    async deleteProduct(req:Request,res:Response){
        try {
            const id = Number(req.params.id);
            const deletedproduct = await productsService.delete(id);
            return res.status(200).json(deletedproduct);
        } catch (error:any) {
            if (error.message === 'this is not number') return res.status(400).json({message:error.message});
            res.status(400).json({message:error.message});
        }
    }

        async createCategory(req: Request, res: Response) {
            try {
                const { name, parentId } = req.body;
                const category = await categorieService.createCategory(name, parentId);
                res.status(201).json(category);
            } catch (error: any) {
                if (error.message === "Parent category not found") return res.status(404).json({ error: error.message });
                
                res.status(400).json({ error: error.message });
            }}
    
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
    
        async updateCategory(req: Request, res: Response) {
            try {
                const idParam = req.params.id;
                if (typeof idParam !== "string") {
                    return res.status(400).json({ error: "Invalid category id" });
                }
                const { name } = req.body;
                const category = await categorieService.updateCategory(parseInt(idParam), name);
                res.status(200).json(category);
            } catch (error: any) {
                if (error.message === "Category not found") return res.status(404).json({ error: error.message });
                res.status(400).json({ error: error.message });
            }
        }
    
        async deleteCategory(req: Request, res: Response) {
            try {
                const idParam = req.params.id;
                if (typeof idParam !== "string") {
                    return res.status(400).json({ error: "Invalid category id" });
                }
                const category = await categorieService.deleteCategory(parseInt(idParam));
                res.status(200).json(category);
            } catch (error: any) {
                if (error.message === "Category not found") return res.status(404).json({ error: error.message });
                res.status(404).json({ error: error.message });
            }
        }
}


export default new AdminController();