import express from 'express';
import userRouter from './auth/user.routes.js';
import productRouter from './products/product.routes.js';
import adminRoutes from './admin/admin.routes.js';
import categorieRouter from './categories/categorie.routes.js';
import cartRouter from './cartItems/cart.route.js';
import orderRouter from './order/order.route.js';
import dotenv from 'dotenv';
import globalErrorHandler from './utils/middleware/error.middleware.js';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/admin', adminRoutes);
app.use('/categories', categorieRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);
app.use(globalErrorHandler)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Backend API</title>
<style>
@keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
}

* {
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
}

body {
    height: 100vh;
    margin: 0;
    background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #6a11cb);
    background-size: 400% 400%;
    animation: gradientMove 12s ease infinite;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
}

.container {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(15px);
    padding: 50px;
    border-radius: 24px;
    width: 420px;
    text-align: center;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
    animation: float 5s ease-in-out infinite;
}

.status {
    display: inline-block;
    padding: 8px 18px;
    border-radius: 999px;
    background: linear-gradient(90deg, #00ff88, #00c853);
    color: #003d1f;
    font-weight: 600;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(0,255,136,0.6);
}

h1 {
    font-size: 36px;
    margin-bottom: 10px;
    letter-spacing: 1px;
}

p {
    opacity: 0.85;
    margin-bottom: 35px;
}

.buttons a {
    display: inline-block;
    margin: 6px;
    padding: 14px 22px;
    border-radius: 12px;
    text-decoration: none;
    color: #fff;
    background: linear-gradient(135deg, #6a11cb, #2575fc);
    box-shadow: 0 10px 30px rgba(37,117,252,0.4);
    transition: all 0.3s ease;
}

.buttons a:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 20px 50px rgba(37,117,252,0.7);
}

.footer {
    margin-top: 30px;
    font-size: 13px;
    opacity: 0.7;
}
</style>
</head>
<body>
    <div class="container">
        <div class="status">LIVE • API ONLINE</div>
        <h1>My Backend</h1>
        <p>Powering the app behind the scenes 🚀</p>

        <div class="buttons">
            <a href="/health">Health</a>
            <a href="/api-docs">Docs</a>
            <a href="/users">Users</a>
        </div>

        <div class="footer">
            ⏱ ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
    `);
});






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
