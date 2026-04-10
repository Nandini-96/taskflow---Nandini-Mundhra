import express from "express";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getProjects);
router.post("/", authenticate, createProject);
router.get("/:id", authenticate, getProjectById);
router.patch("/:id", authenticate, updateProject);
router.delete("/:id", authenticate, deleteProject);

export default router;