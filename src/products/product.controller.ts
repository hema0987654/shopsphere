import productsService from "./products.service.js";
import type { Request,Response } from "express";

class ProductController{


    async getProductById(req:Request,res:Response){
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({message:'Product ID is required'});
            const product = await productsService.getByid(+id);
            return res.status(200).json(product);
        } catch (error:any) {
            if (error.message === 'this is not number') return res.status(400).json({message:error.message});
            res.status(404).json({message:error.message});
        }
    }

    async getAllProducts(req:Request,res:Response){
        try {
            const products = await productsService.getAll();
            res.status(200).json(products);
        } catch (error:any) {
            res.status(500).json({message:error.message});
        }
    }
}

export default new ProductController();