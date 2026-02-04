import AppError from "../utils/AppError.js";
import productdb from "./data/products.query.js";
import type{ ProductsInfo } from "./data/products.query.js";
import productv from "./validation/product.dto.js";
import db from "../configs/DB.js";

class ProductService{
    async create(info:ProductsInfo){
        await productv.validateCreate(info);
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
        const hasAnyField =
            info.title !== undefined ||
            info.description !== undefined ||
            info.price !== undefined ||
            info.stock !== undefined ||
            info.image_url !== undefined;
        if (!hasAnyField) throw new AppError("No fields to update", 400);
        await productv.validateUpdate(info);
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

    async getLowStock(threshold: number) {
        if (Number.isNaN(threshold) || threshold < 0) {
            throw new AppError("threshold must be a non-negative number", 400);
        }
        return await productdb.getLowStockProducts(threshold);
    }

    async setStock(id: number, stock: number) {
        if (Number.isNaN(id)) throw new AppError("this is is not number", 400);
        if (Number.isNaN(stock) || stock < 0) throw new AppError("stock must be a non-negative number", 400);
        const updated = await productdb.updateProduct(id, { stock });
        if (!updated) throw new AppError("this is not found", 404);
        return updated;
    }

    async adjustStock(id: number, delta: number) {
        if (Number.isNaN(id)) throw new AppError("this is is not number", 400);
        if (!Number.isFinite(delta) || Number.isNaN(delta)) throw new AppError("delta must be a number", 400);

        const client = await db.connect();
        try {
            await client.query("BEGIN");
            const existing = await productdb.findByIdForUpdate(client, id);
            if (!existing) throw new AppError("this is not found", 404);

            const existingStock = Number((existing as any)?.stock);
            if (Number.isNaN(existingStock)) throw new AppError("Invalid existing stock", 500);
            const nextStock = existingStock + delta;
            if (nextStock < 0) throw new AppError("stock cannot be negative", 400);

            const updated = await productdb.updateStock(client, id, nextStock);
            if (!updated) throw new AppError("this is not found", 404);
            await client.query("COMMIT");
            return updated;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async setPrice(id: number, price: number) {
        if (Number.isNaN(id)) throw new AppError("this is is not number", 400);
        if (Number.isNaN(price) || price <= 0) throw new AppError("price must be a positive number", 400);
        const updated = await productdb.updateProduct(id, { price });
        if (!updated) throw new AppError("this is not found", 404);
        return updated;
    }

    async bulkUpdate(updates: Array<{ id: number } & Partial<ProductsInfo>>) {
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new AppError("updates must be a non-empty array", 400);
        }

        const client = await db.connect();
        try {
            await client.query("BEGIN");
            const results: any[] = [];
            for (const update of updates) {
                const id = Number((update as any)?.id);
                if (Number.isNaN(id)) throw new AppError("Invalid product id in updates", 400);
                const { id: _ignored, ...info } = update as any;

                const hasAnyField =
                    info.title !== undefined ||
                    info.description !== undefined ||
                    info.price !== undefined ||
                    info.stock !== undefined ||
                    info.image_url !== undefined;
                if (!hasAnyField) throw new AppError(`No fields to update for product ${id}`, 400);

                await productv.validateUpdate(info);
                const updated = await productdb.updateProduct(id, info, client);
                if (!updated) throw new AppError(`Product ${id} not found`, 404);
                results.push(updated);
            }
            await client.query("COMMIT");
            return results;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
}

export default new ProductService();
