import {Pool} from 'pg';
import dotenv from 'dotenv';
dotenv.config();

 const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432
   
});

db.on('connect', () => {
  console.log('✅ Database connected');
});

db.on('error', (err) => {
  console.error('❌ Database error', err);
  process.exit(1);
});

export default db;

