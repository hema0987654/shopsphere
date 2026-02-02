import cartService from "./cart.service.js";
import type{ Request, Response } from "express";
import AppError from "../utils/AppError.js";
class CartController {

    async addItemToCart(req: Request, res: Response) {
            const userId = (req as any).user.id;
            const {productId, quantity } = req.body;
            const cartItem = await cartService.addItemToCart(userId, productId, quantity);
            return res.status(201).json(cartItem);
        
    }

    async getCartItems(req: Request, res: Response) {
            const userId = (req as any).user.id;
            const cartItems = await cartService.getCartItems(userId);
            return res.status(200).json(cartItems);
        
    }

    async updateCartItem(req: Request, res: Response) {
            const cartId = parseInt(req.params.cartId as string, 10);
            const { quantity } = req.body;
            const payload =  (req as any).user;  
        if (!payload || !payload.id) throw new AppError("User not authenticated", 401);

            const updatedCartItem = await cartService.updateCartItem(cartId, quantity, payload.id);
            return res.status(200).json(updatedCartItem);
    }
    async removeCartItem(req: Request, res: Response) {
            const cartId = parseInt(req.params.cartId as string, 10);
            const userId = (req as any).user.id;
            if (!userId) throw new AppError("User not authenticated", 401);
            const deletedCartItem = await cartService.removeCartItem(cartId, userId);
            return res.status(200).json(deletedCartItem);
    }  
}

export default new CartController();