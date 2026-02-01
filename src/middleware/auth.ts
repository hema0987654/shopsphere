import jwt from 'jsonwebtoken';
import type{ Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

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

    jwt.verify(token, JWT_SECRET as string, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
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