import express from 'express';
import userRouter from './users/router.js';

import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/users', userRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});