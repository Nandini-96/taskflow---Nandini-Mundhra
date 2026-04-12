import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

//PostgreSQL connection setup in Node.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;