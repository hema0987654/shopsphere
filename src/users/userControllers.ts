import userService from "./userService.js";
import type { Request, Response } from "express";

class UserControllers {
    constructor(private userservice: typeof userService = userService) {}
    async register(req: Request, res: Response) {
        try {
            const result = await this.userservice.register(req.body);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    async verifyOTP(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;
            const result = await this.userservice.verifyOTP(email, otp);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await this.userservice.login(email, password);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }    
    }

}

export default new UserControllers();