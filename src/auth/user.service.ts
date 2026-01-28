import UserDB from "./entitys/user.entity.js";
import bcrypt from "bcrypt";
import { UserRole, type UpdateUserDTO, type UserInfo } from "./entitys/user.entity.js";
import userv from "./validation/user.dto.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import PendingUsersDB from "./entitys/pendingusers.entity.js";
import { sendOTP } from "../utils/sendotp.js";
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
        if (existingUser) throw new Error('User with this email already exists');

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
            throw new Error('User not found');
        }
        if (pendingUser.otp !== otp) throw new Error('Invalid OTP');

        if (pendingUser.otp_expires_at < new Date()) throw new Error('OTP expired');
        const findByEmail = await UserDB.findByEmail(email);
        if (findByEmail) throw new Error('User already verified');
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
        if (!user) throw new Error('User not found');
        const pass = await bcrypt.compare(password, user.password_hash);
        if (!pass) throw new Error('Invalid password');

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
        if (!user) throw new Error('User not found');
        return user;
    }
    async getAllUsers() {
        const users = await UserDB.getAllUsers();
        return users;
    }
    async deleteUserById(id: number) {
        const user = await UserDB.deleteById(id);
        if (!user) throw new Error('User not found');
        return user;
    }


    async updateUserById(id: number, updates: UpdateUserDTO) {
        try {
            const user = await UserDB.updateUser(id, updates);
            if (!user) throw new Error('User not found');
            return user;
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    async forgetpass(email: string) {
        const user = await UserDB.findByEmail(email);
        if (!user) throw new Error('User not found');
        const otp = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await PendingUsersDB.createPendingUser({ ...user, role: (user.role || 'user') as UserRole, otp, otp_expires_at: otpExpiresAt });
        await sendOTP(email, otp);
        return { message: 'OTP has been sent to your email' };
    }
    async verifyForgetPass(email: string, otp: string, newPassword: string) {
        const pendingUser = await PendingUsersDB.findPendingUserByEmail(email);
        if (!pendingUser) throw new Error('User not found');
        if (pendingUser.otp !== otp) throw new Error('Invalid OTP');
        if (pendingUser.otp_expires_at < new Date()) throw new Error('OTP expired');
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const user = await UserDB.updatePassword(email, newPasswordHash);
        await PendingUsersDB.deletePendingUserByEmail(email);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        return { user, token };
    }
}

export default new UserService();