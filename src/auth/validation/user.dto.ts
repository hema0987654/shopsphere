import AppError from "../../utils/AppError.js";
import type { UserInfo } from "../data/user.query.js";
class userv {
    private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    private validRoles = ['admin', 'user'];
    //   private phoneRegex = /^[0-9]{10,15}$/;

    async validateFirstName(first_name: string) {
        if (first_name.trim().length === 0) {
            throw new AppError('First name cannot be empty', 400);
        }
    }

    async validateLastName(last_name: string) {
        if (last_name.trim().length === 0) {
            throw new AppError('Last name cannot be empty', 400);
        }
    }
    async validateEmail(email: string) {
        if (!this.emailRegex.test(email)) {
            throw new AppError('Invalid email format', 400);
        }
    }

    async validatePassword(password: string) {
        if (password.length < 8) {
            throw new AppError('Password must be at least 8 characters long', 400);
        }
        if (!this.passwordRegex.test(password)) {
            throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 400);
        }
    }

    async validateRole(role: string) {
       if (!this.validRoles.includes(role)) {
            throw new AppError('Invalid user role', 400);
        }
    }

    async validateUpdate(info: Partial<UserInfo>) {
        const allowedFieldsForUser = ["password_hash", "first_name", "last_name", "avatar_url"];

        for (const field in info) {
            if (!allowedFieldsForUser.includes(field)) {
                throw new AppError(`You are not allowed to update ${field}`, 400);
            }
        }
        if(info.first_name){
            await this.validateFirstName(info.first_name);
        }
        if (info.last_name) {
            await this.validateLastName(info.last_name);
        }
        if (info.password_hash) {
            await this.validatePassword(info.password_hash);
        }
    }

    async validateUserInfo(userInfo: UserInfo) {
        await this.validateEmail(userInfo.email);
        await this.validateFirstName(userInfo.first_name);
        await this.validateLastName(userInfo.last_name);
        await this.validatePassword(userInfo.password_hash);
        await this.validateRole(userInfo.role || 'user');
    }
}
export default new userv();