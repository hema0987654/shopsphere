import { authenticateToken } from "../utils/middleware/auth.js";
import productController from "./product.controller.js";

import{ Router } from "express";
const productRouter = Router();

productRouter.get("/:id", authenticateToken, productController.getProductById);
productRouter.get("/", authenticateToken, productController.getAllProducts);
export default productRouter;