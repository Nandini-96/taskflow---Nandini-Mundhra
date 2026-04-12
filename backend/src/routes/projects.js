import express from "express";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getProjects);
router.post("/", authenticate, createProject);
router.get("/:id", authenticate, getProjectById);
router.patch("/:id", authenticate, updateProject);
router.delete("/:id", authenticate, deleteProject);
router.get("/:id/stats", authenticate, getProjectStats);
export default router;