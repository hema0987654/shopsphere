import UserDB from "./data/user.query.js";
import bcrypt from "bcrypt";
import { UserRole, type UpdateUserDTO, type UserInfo } from "./data/user.query.js";
import userv from "./validation/user.dto.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import PendingUsersDB from "./data/pendingusers.query.js";
import { sendOTP } from "../utils/sendotp.js";
import AppError from "../utils/AppError.js";
dotenv.config();
const admin_email = process.env.ADMIN_EMAIL ;

class UserService {
    private generateOTP(length = 6) {
        return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    }
    async register(info: UserInfo) {
        await userv.validateUserInfo(info);
        if (info.email !== admin_email) {
            info.role = UserRole.User;
        } else {
            info.role = UserRole.Admin;
        }
        info.password_hash = await bcrypt.hash(info.password_hash, 10);

        const otp = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const existingUser = await UserDB.findByEmail(info.email);
        if (existingUser) throw new AppError('User with this email already exists', 400);

        const existingPendingUser = await PendingUsersDB.findPendingUserByEmail(info.email);
        if (existingPendingUser) {
            await PendingUsersDB.updateOtp(info.email, otp, otpExpiresAt);
            await sendOTP(info.email, otp);
            return { message: 'OTP has been sent to your email' };
        }

        await PendingUsersDB.createPendingUser({ ...info, role: (info.role || 'user') as UserRole, otp, otp_expires_at: otpExpiresAt });
        await sendOTP(info.email, otp);

        return { message: 'OTP has been sent to your email' };
    }


    async verifyOTP(email: string, otp: string) {
        const pendingUser = await PendingUsersDB.findPendingUserByEmail(email);
        if (!pendingUser) {
            throw new AppError('User not found', 404);
        }
        if (pendingUser.otp !== otp) throw new AppError('Invalid OTP', 400);

        if (pendingUser.otp_expires_at < new Date()) throw new AppError('OTP expired', 400);
        const findByEmail = await UserDB.findByEmail(email);
        if (findByEmail) throw new AppError('User already verified', 400);
        const user = await UserDB.createUser({
            first_name: pendingUser.first_name,
            last_name: pendingUser.last_name,
            email: pendingUser.email,
            password_hash: pendingUser.password_hash,
            role: pendingUser.role,
            avatar_url: pendingUser.avatar_url ?? ''
        });
        await PendingUsersDB.deletePendingUserByEmail(email);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        const { password_hash, ...safeUser } = user;
        return { user: safeUser, token };
    }

    async login(email: string, password: string) {
        await userv.validateEmail(email);
        const user = await UserDB.findByEmail(email);
        if (!user) throw new AppError('User not found', 404);
        if ((user as any)?.is_active === false) throw new AppError("Account is deactivated", 403);
        const pass = await bcrypt.compare(password, user.password_hash);
        if (!pass) throw new AppError('Invalid password', 400);

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        const { password_hash, ...safeUser } = user;
        return { user: safeUser, token };
    }
    async getUserByEmail(email: string) {
        const user = await UserDB.findByEmail(email);
        return user;
    }

    async getUserById(id: number) {
        const user = await UserDB.findById(id);
        if (!user) throw new AppError('User not found', 404);
        return user;
    }
    async getUsersWithPagination(offset: number, limit: number) {
        if (isNaN(offset) || isNaN(limit)) {
            throw new AppError('Invalid offset or limit', 400);
        }
        if (offset < 0 || limit < 1) {
            throw new AppError('Offset must be non-negative and limit must be at least 1', 400);
        }
        if (limit > 100) {
            throw new AppError('Limit cannot exceed 100', 400);
        }
        const users = await UserDB.getUsersWithPagination(offset, limit);
        return users;
    }
    async deleteUserById(id: number) {
        const user = await UserDB.deleteById(id);
        if (!user) throw new AppError('User not found', 404);
        return user;
    }


    async updateUserById(id: number, updates: UpdateUserDTO) {
        if (Number.isNaN(id)) {
            throw new AppError("Invalid user id", 400);
        }
        if (!updates || typeof updates !== "object") {
            throw new AppError("Invalid updates payload", 400);
        }

        await userv.validateUpdate(updates as any);

        const updatesToSave: any = { ...(updates as any) };
        if (typeof updatesToSave.password_hash === "string") {
            updatesToSave.password_hash = await bcrypt.hash(updatesToSave.password_hash, 10);
        }

        const user = await UserDB.updateUser(id, updatesToSave);
        if (!user) throw new AppError("User not found", 404);
        const { password_hash, ...safeUser } = user as any;
        return safeUser;
    }

    async setUserActiveStatus(id: number, isActive: boolean) {
        if (Number.isNaN(id)) {
            throw new AppError("Invalid user id", 400);
        }
        const user = await UserDB.setActiveStatus(id, isActive);
        if (!user) throw new AppError("User not found", 404);
        return user;
    }

    async forgetpass(email: string) {
        const user = await UserDB.findByEmail(email);
        if (!user) throw new AppError('User not found', 404);
        const otp = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await PendingUsersDB.createPendingUser({ ...user, role: (user.role || 'user') as UserRole, otp, otp_expires_at: otpExpiresAt });
        await sendOTP(email, otp);
        return { message: 'OTP has been sent to your email' };
    }
    async verifyForgetPass(email: string, otp: string, newPassword: string) {
        const pendingUser = await PendingUsersDB.findPendingUserByEmail(email);
        if (!pendingUser) throw new AppError('User not found', 404);
        if (pendingUser.otp !== otp) throw new AppError('Invalid OTP', 400);
        if (pendingUser.otp_expires_at < new Date()) throw new AppError('OTP expired', 400);
        await userv.validatePassword(newPassword);
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const user = await UserDB.updatePassword(email, newPasswordHash);
        await PendingUsersDB.deletePendingUserByEmail(email);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        return { user, token };
    }
}

export default new UserService();
