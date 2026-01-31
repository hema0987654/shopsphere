import adminController from "./admin.controller.js";
import { authenticateToken,adminOnly } from "../middleware/auth.js";


import { Router } from "express";
const adminRoutes = Router();

// User management routes
adminRoutes.get("/users/:id", authenticateToken,adminOnly, adminController.getUserById);
adminRoutes.get("/users", authenticateToken,adminOnly, adminController.getAllUsers);
adminRoutes.delete("/users/:id", authenticateToken,adminOnly, adminController.deleteUserById);
// Product management routes
adminRoutes.post("/products", authenticateToken,adminOnly, adminController.createProduct);
adminRoutes.put("/products/:id", authenticateToken,adminOnly, adminController.updateProduct);
adminRoutes.delete("/products/:id", authenticateToken,adminOnly, adminController.deleteProduct);

// category management routes
adminRoutes.post("/categories", authenticateToken,adminOnly, adminController.createCategory);
adminRoutes.put("/categories/:id", authenticateToken,adminOnly, adminController.updateCategory);
adminRoutes.delete("/categories/:id", authenticateToken,adminOnly, adminController.deleteCategory);

export default adminRoutes;