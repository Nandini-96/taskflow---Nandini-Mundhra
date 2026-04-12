import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
const { Pool } = pkg;

//PostgreSQL connection setup in Node.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;