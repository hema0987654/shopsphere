import productdb from "./entitys/products.entity.js";
import type{ ProductsInfo } from "./entitys/products.entity.js";

class ProductService{
    async create(info:ProductsInfo){
       const newproduct = await productdb.createProduct(info);
       return newproduct
    }

    async getByid(id:number){
        if(isNaN(id)) throw new Error('this is is not number')
        const product = await productdb.findById(id)
        if (!product) throw new Error('this is not found')
        return product
    }
    async getAll(){
        const products = await productdb.getAllProduct()
        return products
    }
    async update(id:number,info:Partial<ProductsInfo>){
        if(isNaN(id)) throw new Error('this is is not number')
        const updatedproduct = await productdb.updateProduct(id,info)
        if (!updatedproduct) throw new Error('this is not found')
        return updatedproduct
    }

    async delete(id:number){
        if(isNaN(id)) throw new Error('this is is not number')
        const deletedproduct = await productdb.deleteById(id)
        if (!deletedproduct) throw new Error('this is not found')
        return deletedproduct
    }
}

export default new ProductService();