import userService from "./user.service.js";
import type { Request, Response } from "express";
import AppError from "../utils/AppError.js";

class UserControllers {
    async register(req: Request, res: Response) {
        const result = await userService.register(req.body);
        return res.status(200).json(result);
    }
    async verifyOTP(req: Request, res: Response) {
        const { email, otp } = req.body;
        const result = await userService.verifyOTP(email, otp);
        return res.status(200).json(result);

    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await userService.login(email, password);
        return res.status(200).json(result);
    }

    async updateUserById(req: Request, res: Response) {
        const id = req.params.id;
        if (typeof id === "undefined") {
            throw new AppError("User ID is required", 400);
        }
        if (isNaN(+id)) {
            throw new AppError("User ID must be a number", 400);
        }
        const idParam = +id;

        const requester = (req as any)?.user;
        if (!requester?.id) {
            throw new AppError("Unauthorized", 401);
        }
        const isAdmin = requester?.role === "admin";
        if (!isAdmin && Number(requester.id) !== idParam) {
            throw new AppError("Forbidden", 403);
        }

        const result = await userService.updateUserById(idParam, req.body);
        return res.status(200).json(result);

    }

    async forgetpass(req: Request, res: Response) {
        const { email } = req.body;
        const result = await userService.forgetpass(email);
        return res.status(200).json(result);

    }

    async verifyForgetPass(req: Request, res: Response) {
        const { email, otp, newPassword } = req.body;
        const result = await userService.verifyForgetPass(email, otp, newPassword);
        return res.status(200).json(result);
    }
}

export default new UserControllers();
