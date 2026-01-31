import categoryEntity from "./entitys/categorie.entity.js";

class CategoryService {


    async createCategory(name: string, parentId: number | null = null) {
        if (!name) throw new Error("Category name is required");
        if (parentId) {
            const parent = await categoryEntity.findById(parentId);
            if (!parent) throw new Error("Parent category not found");
        }
        return await categoryEntity.create(name, parentId);
    }
    async getAllCategories() {
        return await categoryEntity.findAll();
    }

    async getCategoryById(id: number) {
        const category = await categoryEntity.findById(id);
        if (!category) throw new Error("Category not found");
        return category;
    }

    async updateCategory(id: number, name: string) {
        const category = await categoryEntity.findById(id);
        if (!category) throw new Error("Category not found");
        if (!name) throw new Error("Category name is required");
        return await categoryEntity.updateById(id, name);
    }

    async deleteCategory(id: number) {
        const category = await categoryEntity.findById(id);
        if (!category) throw new Error("Category not found");
        return await categoryEntity.deleteById(id);
    }

}

export default new CategoryService();