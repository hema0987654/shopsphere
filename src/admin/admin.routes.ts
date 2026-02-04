import adminController from "./admin.controller.js";
import { authenticateToken,adminOnly } from "../utils/middleware/auth.js";
import { productImageUpload } from "../utils/middleware/upload.js";
import { auditAdminRequests } from "../utils/middleware/audit.middleware.js";


import { Router } from "express";
const adminRoutes = Router();

adminRoutes.use(authenticateToken, adminOnly, auditAdminRequests);

// User management routes
adminRoutes.get("/users/:id", adminController.getUserById);
adminRoutes.get("/users", adminController.getAllUsers);
adminRoutes.delete("/users/:id", adminController.deleteUserById);
adminRoutes.patch("/users/:id/active", adminController.setUserActiveStatus);
// Product management routes
adminRoutes.get("/products/low-stock", adminController.getLowStockProducts);
adminRoutes.get("/products/export", adminController.exportProductsCsv);
adminRoutes.patch("/products/bulk", adminController.bulkUpdateProducts);
adminRoutes.post("/products", adminController.createProduct);
adminRoutes.post("/products/:id/image", productImageUpload, adminController.uploadProductImage);
adminRoutes.patch("/products/:id/stock", adminController.updateProductStock);
adminRoutes.patch("/products/:id/price", adminController.updateProductPrice);
adminRoutes.put("/products/:id", adminController.updateProduct);
adminRoutes.delete("/products/:id", adminController.deleteProduct);

// category management routes
adminRoutes.post("/categories", adminController.createCategory);
adminRoutes.put("/categories/:id", adminController.updateCategory);
adminRoutes.delete("/categories/:id", adminController.deleteCategory);

// reviews moderation routes
adminRoutes.get("/reviews", adminController.listReviews);
adminRoutes.delete("/reviews/:id", adminController.deleteReviewById);

// dashboard routes
adminRoutes.get("/dashboard/overview", adminController.getDashboardOverview);
adminRoutes.get("/dashboard/best-sellers", adminController.getBestSellers);
adminRoutes.get("/dashboard/stale-products", adminController.getStaleProducts);

export default adminRoutes;
