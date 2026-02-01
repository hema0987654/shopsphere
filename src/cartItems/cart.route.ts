import CartController from "./cart.controller.js";
import { Router } from "express";
import { authenticateToken,userOnly } from "../middleware/auth.js";
const cartRouter = Router();

cartRouter.post("/", authenticateToken, userOnly, CartController.addItemToCart);
cartRouter.get("/", authenticateToken, userOnly, CartController.getCartItems);
cartRouter.put("/:cartId", authenticateToken, userOnly, CartController.updateCartItem);
cartRouter.delete("/:cartId", authenticateToken, userOnly, CartController.removeCartItem);

export default cartRouter;