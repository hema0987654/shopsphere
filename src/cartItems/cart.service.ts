import cartDb from "./data/cart.query.js";
import UserDB from "../auth/data/user.query.js";
import productdb from "../products/data/products.query.js";
import cartDto from "./validation/cart.dto.js";
import AppError from "../utils/AppError.js";

class CartService {

    private async verifyOwnership(cartId: number, userId: number) {
        const cartItem = await cartDb.findCartItemById(cartId);
        if (!cartItem) throw new AppError("Cart item does not exist", 404);
        if (cartItem.user_id !== userId) throw new AppError("Not authorized to modify this cart item", 403);
        return cartItem;
    }

    async addItemToCart(userId: number, productId: number, quantity: number) {
        await cartDto.validateAddItem({ userId, productId, quantity });
        const user = await UserDB.findById(userId);
        if (!user) throw new AppError("User does not exist", 404);
        const product = await productdb.findById(productId);
        if (!product) throw new AppError("Product does not exist", 404);
        if (product.stock < quantity) throw new AppError("Insufficient stock available", 400);

        const cartItems = await cartDb.getCartByUserId(userId);
        if (cartItems.find((item: any) => item.product_id === productId)) {
            throw new AppError("Product already in cart", 400);
        }
        return await cartDb.createCart(userId, productId, quantity);
    }

    async getCartItems(userId: number) {
        if (userId == null || userId <= 0) throw new AppError("Invalid user ID", 400);
        const user = await UserDB.findById(userId);
        if (!user) throw new AppError("User does not exist", 404);
        const cartItems = await cartDb.getCartByUserId(userId);
        if (!cartItems) throw new AppError("No cart items found for this user", 404);
        return cartItems;
    }
    async updateCartItem(cartId: number, quantity: number, userId: number) {
        await cartDto.validateUpdate({ cartId, quantity });
        await this.verifyOwnership(cartId, userId);
        const cartItem = await cartDb.findCartItemById(cartId);
        const product = await productdb.findById(cartItem.product_id);
        if (!product) throw new AppError("Product does not exist", 404);
        if (product.stock < quantity) throw new AppError("Insufficient stock available", 400);
        const updated = await cartDb.updateCartItemQuantity(cartId, quantity);
        if (!updated) throw new AppError("Failed to update cart item", 500);
        return updated;
    }

    async removeCartItem(cartId: number, userId: number) {
        const cartItem = await this.verifyOwnership(cartId, userId);
        if (!cartItem) throw new AppError("Cart item does not exist", 404);
        return await cartDb.deleteCartItem(cartId);
    }
}

export default new CartService();
