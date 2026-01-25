import type { UserInfo } from "../entitys/userDB.js";
class userv {
    private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    private validRoles = ['admin', 'user'];
    //   private phoneRegex = /^[0-9]{10,15}$/;
    async validateEmail(email: string) {
        if (!this.emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    async validatePassword(password: string) {
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        if (!this.passwordRegex.test(password)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        }
    }

    async validateRole(role: string) {
       if (!this.validRoles.includes(role)) {
            throw new Error('Invalid user role');
        }
    }

    async validateUserInfo(userInfo: UserInfo) {
        await this.validateEmail(userInfo.email);
        await this.validatePassword(userInfo.password_hash);
        await this.validateRole(userInfo.role);
    }
}
export default new userv();