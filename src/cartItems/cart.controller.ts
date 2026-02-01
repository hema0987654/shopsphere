import cartService from "./cart.service.js";
import type{ Request, Response } from "express";

function handleError(res: Response, error: unknown) {
    const msg = (error as Error).message;

    if (["User does not exist", "Product does not exist", "No cart items found for this user"].includes(msg)) {
        return res.status(404).json({ error: msg });
    }
    if (msg === "Product already in cart") return res.status(409).json({ error: msg });
    if (msg.includes("Not authorized")) return res.status(403).json({ error: msg });
    return res.status(400).json({ error: msg });
}
class CartController {

    async addItemToCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const {  productId, quantity } = req.body;
            const cartItem = await cartService.addItemToCart(userId, productId, quantity);
            return res.status(201).json(cartItem);
        } catch (error) {
            if((error as Error).message === "User does not exist" || (error as Error).message === "Product does not exist" || (error as Error).message === "Product already in cart") {
                return res.status(404).json({ error: (error as Error).message });
            }
            return handleError(res, error);
        }
    }

    async getCartItems(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const cartItems = await cartService.getCartItems(userId);
            return res.status(200).json(cartItems);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async updateCartItem(req: Request, res: Response) {
        try {
            const cartId = parseInt(req.params.cartId as string, 10);
            const { quantity } = req.body;
            const payload =  (req as any).user;  
             console.log(payload);
             console.log(payload.id);
             
             
        if (!payload || !payload.id) return res.status(401).json({ error: "User not authenticated" });

            const updatedCartItem = await cartService.updateCartItem(cartId, quantity, payload.id);
            return res.status(200).json(updatedCartItem);
        } catch (error) {
            return handleError(res, error);
        }
    }
    async removeCartItem(req: Request, res: Response) {
        try {
            const cartId = parseInt(req.params.cartId as string, 10);
            const userId = await(req as any).user.id;
            if (!userId) return res.status(401).json({ error: "User not authenticated" });
            console.log("req.user:", (req as any).user);

            
            const deletedCartItem = await cartService.removeCartItem(cartId, userId);

            return res.status(200).json(deletedCartItem);
        } catch (error) {
            return handleError(res, error);
        }
    }  
}

export default new CartController();