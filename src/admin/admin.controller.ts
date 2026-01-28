import userService from "../auth/user.service.js";
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
                const result = await userService.getAllUsers();
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
}


export default new AdminController();