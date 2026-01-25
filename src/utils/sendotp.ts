import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

export async function sendOTP(email: string, otp: string) {
    const mailOptions = {
        from: `"ShopSphere" <${process.env.EMAIL}>`, // اسم العرض
        to: email,
        subject: '🔐 Your OTP Code',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h2 style="color: #4f46e5; text-align: center;">ShopSphere</h2>
                <p>Hi there,</p>
                <p>Your OTP code is:</p>
                <h1 style="text-align: center; color: #ff6b6b; letter-spacing: 5px;">${otp}</h1>
                <p style="font-size: 14px; color: #555;">This code will expire in 15 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">If you didn't request this code, please ignore this email.</p>
            </div>
        </div>
        `
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
}
