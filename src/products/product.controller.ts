import AppError from "../utils/AppError.js";
import productsService from "./products.service.js";
import type { Request,Response } from "express";

class ProductController{


    async getProductById(req:Request,res:Response){
            const id = req.params.id;
            if (!id) throw new AppError('ID parameter is missing', 400);
            const product = await productsService.getByid(+id);
            return res.status(200).json(product);
       
    }

    async getAllProducts(req:Request,res:Response){
            const products = await productsService.getAll();
            res.status(200).json(products);
    }
}

export default new ProductController();