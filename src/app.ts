import express from 'express';
import userRouter from './auth/user.routes.js';
import productRouter from './products/product.routes.js';
import adminRoutes from './admin/admin.routes.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
