import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "taskflow_db",
  password: "Insp@153",   
  port: 5432,
});

export default pool;