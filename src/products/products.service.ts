import AppError from "../utils/AppError.js";
import productdb from "./data/products.query.js";
import type{ ProductsInfo } from "./data/products.query.js";

class ProductService{
    async create(info:ProductsInfo){
        if(!info.title) throw new AppError('title is required', 400)
        if(!info.price) throw new AppError('price is required', 400)
        if(!info.stock) throw new AppError('stock is required', 400)
       const newproduct = await productdb.createProduct(info);
       return newproduct
    }

    async getByid(id:number){
        if(isNaN(id)) throw new AppError('this is is not number', 400)
        const product = await productdb.findById(id)
        if (!product) throw new AppError('this is not found', 404)
        return product
    }
    async getAll(){
        const products = await productdb.getAllProduct()
        return products
    }
    async update(id:number,info:Partial<ProductsInfo>){
        if(isNaN(id)) throw new AppError('this is is not number', 400)
        const updatedproduct = await productdb.updateProduct(id,info)
        if (!updatedproduct) throw new AppError('this is not found', 404)
        return updatedproduct
    }

    async delete(id:number){
        if(isNaN(id)) throw new AppError('this is is not number', 400)
        const deletedproduct = await productdb.deleteById(id)
        if (!deletedproduct) throw new AppError('this is not found', 404)
        return deletedproduct
    }
}

export default new ProductService();