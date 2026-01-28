import userService from "./user.service.js";
import type { Request, Response } from "express";

class UserControllers {
    async register(req: Request, res: Response) {
        try {
            const result = await userService.register(req.body);
            return res.status(200).json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    async verifyOTP(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;
            const result = await userService.verifyOTP(email, otp);
            return res.status(200).json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await userService.login(email, password);
            return res.status(200).json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }    
    }

    async updateUserById(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (typeof id === "undefined") {
                return res.status(400).json({ error: "User ID parameter is required." });
            }
            const idParam = +id;
            const result = await userService.updateUserById(idParam, req.body);
            return res.status(200).json(result);
        } catch (err: any) {
            if (err.message === 'User not found') return res.status(404).json({ error: err.message });
            res.status(400).json({ error: err.message });
        }
    }

    async forgetpass(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const result = await userService.forgetpass(email);
            return res.status(200).json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    async verifyForgetPass(req: Request, res: Response) {    
        try {
            const { email, otp, newPassword } = req.body;
            const result = await userService.verifyForgetPass(email, otp, newPassword);
            return res.status(200).json(result);
        } catch (err: any) {
            if (err.message === 'User not found') return res.status(404).json({ error: err.message });
            res.status(400).json({ error: err.message });
        }
    }


}

export default new UserControllers();