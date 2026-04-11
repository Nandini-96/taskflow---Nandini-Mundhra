import pool from "../db.js";

// GET /projects
export const getProjects = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT DISTINCT p.*
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.owner_id = $1 OR t.assignee_id = $1
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      page,
      limit,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /projects
export const createProject = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "validation failed",
      fields: { name: "is required" },
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, req.user.user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /projects/:id
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: "not found" });
    }

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1",
      [id]
    );

    res.json({
      ...project.rows[0],
      tasks: tasks.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /projects/:id
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const projectRes = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (!projectRes.rows.length) {
      return res.status(404).json({ error: "not found" });
    }

    const project = projectRes.rows[0];

    // owner check
    if (project.owner_id !== req.user.user_id) {
      return res.status(403).json({ error: "forbidden" });
    }

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [name, description, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /projects/:id
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const projectRes = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (!projectRes.rows.length) {
      return res.status(404).json({ error: "not found" });
    }

    const project = projectRes.rows[0];

    if (project.owner_id !== req.user.user_id) {
      return res.status(403).json({ error: "forbidden" });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);

    res.json({ message: "project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getProjectStats = async (req, res) => {
  const { id } = req.params;

  try {
    // check project exists
    const projectRes = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (!projectRes.rows.length) {
      return res.status(404).json({ error: "not found" });
    }

    // tasks by status
    const statusStats = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM tasks
       WHERE project_id = $1
       GROUP BY status`,
      [id]
    );

    // tasks by assignee
    const assigneeStats = await pool.query(
      `SELECT assignee_id, COUNT(*) as count
       FROM tasks
       WHERE project_id = $1
       GROUP BY assignee_id`,
      [id]
    );

    res.json({
      by_status: statusStats.rows,
      by_assignee: assigneeStats.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};