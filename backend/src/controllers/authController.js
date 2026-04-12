import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import logger from "../logger.js";
const SALT_ROUNDS = 12;

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if user exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("ERROR:", err);  
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0]; // ✅ THIS LINE FIXES EVERYTHING
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    logger.info({
    msg: "Login successful",
    user_id: user.id,
    email: user.email,
  });
    return res.status(200).json({
      access_token: token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err); // helpful debug
    return res.status(500).json({ error: err.message });
  }
};
