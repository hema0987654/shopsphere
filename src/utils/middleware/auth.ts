import jwt from 'jsonwebtoken';
import type{ Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import UserDB from '../../auth/data/user.query.js';

export interface AuthRequest extends Express.Request {
    user?: { id: number; role: string };
}

dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET ;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); 

    jwt.verify(token, JWT_SECRET as string, async (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        const userId = Number((user as any)?.id);
        if (Number.isNaN(userId) || userId <= 0) return res.sendStatus(401);

        try {
            const dbUser = await UserDB.findById(userId);
            if (!dbUser) return res.sendStatus(401);
            if ((dbUser as any)?.is_active === false) {
                return res.status(403).json({ message: "Account is deactivated" });
            }
            // Ensure role stays in sync with DB (defense-in-depth).
            if (req.user) (req.user as any).role = (dbUser as any)?.role ?? (req.user as any).role;
        } catch {
            return res.sendStatus(500);
        }
        next();
    });
};
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" }); 
    }
    next();
};

export const userOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'user') {
        return res.status(403).json({ message: "Access denied" }); 
    }
    next();
};
