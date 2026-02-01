import cartDb from "./entity/cart.entity.js";
import UserDB from "../auth/entitys/user.entity.js";
import productdb from "../products/entitys/products.entity.js";
import cartDto from "./validation/cart.dto.js";

class CartService {

    private async verifyOwnership(cartId: number, userId: number) {
        const cartItem = await cartDb.findCartItemById(cartId);
        if (!cartItem) throw new Error("Cart item does not exist");
        if (cartItem.user_id !== userId) throw new Error("Not authorized to modify this cart item");
        return cartItem;
    }

    async addItemToCart(userId: number, productId: number, quantity: number) {
        await cartDto.validateAddItem({ userId, productId, quantity });
        const user = await UserDB.findById(userId);
        if (!user) throw new Error("User does not exist");
        const product = await productdb.findById(productId);
        if (!product) throw new Error("Product does not exist");
        if (product.stock < quantity) throw new Error("Insufficient stock available");

        const cartItem = await cartDb.getCartByUserId(userId);
        if (cartItem.find((item) => item.productId === productId)) throw new Error("Product already in cart");

        if (!product) throw new Error("Product does not exist");
        await productdb.updateStock(productId, product.stock - quantity);
        return await cartDb.createCart(userId, productId, quantity);
    }

    async getCartItems(userId: number) {
        if (userId == null || userId <= 0) throw new Error("Invalid user ID");
        const user = await UserDB.findById(userId);
        if (!user) throw new Error("User does not exist");
        const cartItems = await cartDb.getCartByUserId(userId);
        if (!cartItems) throw new Error("No cart items found for this user");
        return cartItems;
    }
    async updateCartItem(cartId: number, quantity: number, userId: number) {
        await cartDto.validateUpdate({ cartId, quantity });
        await this.verifyOwnership(cartId, userId);
        const cartItem = await cartDb.findCartItemById(cartId);
        const product = await productdb.findById(cartItem.product_id);
        const diff = quantity - cartItem.quantity;
        if (diff > 0 && product.stock < diff) throw new Error("Insufficient stock");
        await productdb.updateStock(product.id, product.stock - diff);
        const updated = await cartDb.updateCartItemQuantity(cartId, quantity);
        if (!updated) throw new Error("Failed to update cart item");
        return updated;
    }

    async removeCartItem(cartId: number, userId: number) {
        const cartItem = await this.verifyOwnership(cartId, userId);
        const product = await productdb.findById(cartItem.product_id);
        if (!product) throw new Error("Product does not exist");
        if (product) {
            await productdb.updateStock(product.id, product.stock + cartItem.quantity);
        }
        return await cartDb.deleteCartItem(cartId);
    }
}

export default new CartService();