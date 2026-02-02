import AppError from "../utils/AppError.js";
import categoryEntity from "./data/categorie.query.js";

class CategoryService {
    getCartItems(userId: number) {
        throw new Error("Method not implemented.");
    }


    async createCategory(name: string, parentId: number | null = null , quantity: number) {
        if (!name) throw new AppError("Category name is required", 400);
        if (parentId) {
            const parent = await categoryEntity.findById(parentId);
            if (!parent) throw new AppError("Parent category not found", 400);
        }
        return await categoryEntity.create(name, parentId, quantity);
    }
    async getAllCategories() {
        return await categoryEntity.findAll();
    }

    async getCategoryById(id: number) {
        const category = await categoryEntity.findById(id);
        if (!category) throw new AppError("Category not found", 404);
        return category;
    }

    async updateCategory(id: number, name: string) {
        const category = await categoryEntity.findById(id);
        if (!category) throw new AppError("Category not found", 404);
        if (!name) throw new AppError("Category name is required", 400);
        return await categoryEntity.updateById(id, name);
    }

    async deleteCategory(id: number) {
        const category = await categoryEntity.findById(id);
        if (!category) throw new AppError("Category not found", 404);
        return await categoryEntity.deleteById(id);
    }

}

export default new CategoryService();