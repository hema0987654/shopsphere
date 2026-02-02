import type{ Request, Response, NextFunction } from "express";
import AppError from "../AppError.js";
export default function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("🔥 UNEXPECTED ERROR:", err); 
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
