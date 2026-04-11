import pool from "../db.js";

// GET /projects/:id/tasks
export const getTasks = async (req, res) => {
  const { id } = req.params; // project_id
  const { status, assignee } = req.query;

  try {
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // base query
    let query = "SELECT * FROM tasks WHERE project_id = $1";
    let values = [id];
    let index = 2;

    // filters
    if (status) {
      query += ` AND status = $${index++}`;
      values.push(status);
    }

    if (assignee) {
      query += ` AND assignee_id = $${index++}`;
      values.push(assignee);
    }

    // pagination
    query += ` ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      page,
      limit,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /projects/:id/tasks
export const createTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignee_id, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "validation failed",
      fields: { title: "is required" },
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks
       (title, description, project_id, assignee_id, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, id, assignee_id, priority, due_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /tasks/:id
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    priority,
    assignee_id,
    due_date,
  } = req.body;

  try {
    const taskRes = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (!taskRes.rows.length) {
      return res.status(404).json({ error: "not found" });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assignee_id = COALESCE($5, assignee_id),
           due_date = COALESCE($6, due_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        title,
        description,
        status,
        priority,
        assignee_id,
        due_date,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /tasks/:id
export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const taskRes = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (!taskRes.rows.length) {
      return res.status(404).json({ error: "not found" });
    }

    const task = taskRes.rows[0];

    const projectRes = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [task.project_id]
    );

    const project = projectRes.rows[0];

    if (
      task.assignee_id !== req.user.user_id &&
      project.owner_id !== req.user.user_id
    ) {
      return res.status(403).json({ error: "forbidden" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};