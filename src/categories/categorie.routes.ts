import categorieController from "./categorie.controller.js";
import { Router } from "express";
import { authenticateToken  } from "../utils/middleware/auth.js";

const categorieRouter = Router();
categorieRouter.get("/", authenticateToken, categorieController.getAllCategories);
categorieRouter.get("/:id",authenticateToken, categorieController.getCategoryById);

export default categorieRouter;