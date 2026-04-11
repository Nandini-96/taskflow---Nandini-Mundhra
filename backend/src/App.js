import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/", taskRoutes);

// error handler (always last)
app.use(errorHandler);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

// graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
export default app;