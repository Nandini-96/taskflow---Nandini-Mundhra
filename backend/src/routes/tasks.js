import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// nested route
router.get("/projects/:id/tasks", authenticate, getTasks);
router.post("/projects/:id/tasks", authenticate, createTask);

router.patch("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

export default router;