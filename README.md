# Taskflow Backend

---

## 1. Overview

Taskflow is a backend service for managing projects and tasks with secure authentication and role-based access control.

It allows users to:

* Register and log in securely
* Create and manage projects
* Create, update, assign, and track tasks
* Filter tasks by status and assignee
* View project-level task statistics

### Tech Stack

* **Backend:** Node.js, Express
* **Database:** PostgreSQL
* **Authentication:** JWT (JSON Web Tokens), bcrypt
* **Migrations:** dbmate
* **Containerization:** Docker, Docker Compose
* **Testing:** Jest, Supertest
* **Logging:** Pino (structured logging)

---

## 2. Architecture Decisions

### Structure

The project follows a layered architecture:

```
Routes → Middleware → Controllers → Database
```

* **Routes:** Define API endpoints and map them to controllers
* **Middleware:** Handle authentication, logging, and error handling
* **Controllers:** Contain business logic and database interaction
* **Database Layer:** PostgreSQL accessed via `pg`

---

### Key Decisions

* **Stateless Authentication (JWT):**

  * Keeps backend scalable and simple
  * No server-side session storage required

* **Separation of Concerns:**

  * Keeps code modular and maintainable
  * Makes testing easier

* **SQL-first approach (no ORM):**

  * Full control over queries
  * Better performance visibility

---

### Tradeoffs

* No refresh token mechanism
  → Simplified auth for assignment scope

* Minimal validation layer
  → Focused on core API functionality

* No role hierarchy (only owner-based checks)
  → Kept authorization simple

* Limited test coverage
  → Only core flows implemented

---

## 3. Running Locally

### Prerequisites

* Docker installed

---

### Steps

```bash
git clone https://github.com/Nandini-96/taskflow---Nandini-Mundhra.git
cd taskflow---Nandini-Mundhra

cp .env.example .env

docker compose up --build
```

---

### Application

```
http://localhost:3000
```

---

### What happens automatically

* PostgreSQL container starts
* API container builds
* Migrations run via dbmate
* Seed data is inserted
* Server starts

---

## 4. Running Migrations

Migrations run automatically on container startup.

If you want to run them manually:

```bash
docker exec -it taskflow_api dbmate up
```

To rollback:

```bash
docker exec -it taskflow_api dbmate down
```

---

## 5. Test Credentials

Seeded user for quick testing:

```
Email:    test@example.com
Password: password123
```

---

## 6. API Reference

### 1. Authentication

#### Register

```
POST /auth/register
```

Request:

```json
{
  "name": "Nandini",
  "email": "nandini@example.com",
  "password": "123456"
}
```
Response:

```json
{
  "message": "User registered",
  "user": {
    "id": "uuid",
    "email": "nandini@example.com"
  }
}
```


---

#### Login

```
POST /auth/login
```
Request:

```json
{
  "email": "nandini@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "access_token": "JWT_TOKEN"
}
```

---

### 2. Projects
All endpoints require: Authorization: Bearer <token>

#### Get Projects

```
GET /projects
Authorization: Bearer <token>
```

Response:

```json
[
  {
    "id": "project_uuid",
    "name": "My Project",
    "description": "Test project",
    "owner_id": "user_uuid",
    "created_at": "2026-04-12T10:00:00.000Z"
  }
]
```


---

#### Create Project

```
POST /projects
```

Request:

```json
{
  "name": "My Project",
  "description": "Test project"
}
```

Response:

```json
{
  "id": "project_uuid",
  "name": "Updated Project Name",
  "description": "Updated description",
  "owner_id": "user_uuid",
  "created_at": "2026-04-12T10:00:00.000Z"
}
```
---

#### Get Project + Tasks

```
GET /projects/:id
```
Response:

```json
{
  "id": "project_uuid",
  "name": "My Project",
  "description": "Test project",
  "owner_id": "user_uuid",
  "created_at": "2026-04-12T10:00:00.000Z",
  "tasks": [
    {
      "id": "task_uuid",
      "title": "Task 1",
      "status": "todo",
      "priority": "high"
    }
  ]
}
```

---

#### Update Project

```
PATCH /projects/:id
```
Request:

```json
{
 "name": "Updated Project Name",
  "description": "Updated description"
}
```

Response:

```json
{
  "id": "project_uuid",
  "name": "Updated Project Name",
  "description": "Updated description",
  "owner_id": "user_uuid",
  "created_at": "2026-04-12T10:00:00.000Z"
}
```
---

#### Delete Project

```
DELETE /projects/:id
```

Response:

```json
{
   "message": "project deleted"
}
```

---

### 3. Tasks

#### Get Tasks (with filters + pagination)

```
GET /projects/:id/tasks?status=todo&page=1&limit=10
```

Response:

```json
{
   "page": 1,
  "limit": 10,
  "data": [
    {
      "id": "task_uuid",
      "title": "Task 1",
      "status": "todo",
      "priority": "high",
      "assignee_id": "user_uuid"
    }
  ]
}
```

---

#### Create Task

```
POST /projects/:id/tasks
```
Request:

```json
{
  "title": "Task 1",
  "description": "Test task",
  "priority": "high"
}
```
Response:

```json
{
  "id": "task_uuid",
  "title": "Task 1",
  "description": "Test task",
  "status": "todo",
  "priority": "high",
  "project_id": "project_uuid"
}
```
---

#### Update Task

```
PATCH /tasks/:id
```
Request:

```json
{
  "title": "Task 1",
  "description": "Test task",
  "priority": "high"
}
```

Response:

```json
{
  "id": "task_uuid",
  "title": "Task 1",
  "status": "in_progress",
  "priority": "medium"
}
```

---

#### Delete Task

```
DELETE /tasks/:id
```

Response:

```json
{
  "message": "task deleted"
}
```

---

### Stats Endpoint

```
GET /projects/:id/stats
```

Response:

```json
{
  "by_status": [
    { "status": "todo", "count": 1 }
  ],
  "by_assignee": [
    { "assignee_id": "...", "count": 2 }
  ]
}
```

---

### Error Handling

All responses use:

```
Content-Type: application/json
```

Error formats:

* **Validation error (400)**

```json
{
  "error": "validation failed",
  "fields": {
    "email": "is required"
  }
}
```

* **Unauthorized (401)**
* **Forbidden (403)**
* **Not found (404)**

---

## 7. Shortcuts Taken
* Implemented only JWT access tokens and skipped refresh tokens to keep the system simple.
* Used manual validation instead of a schema-based library (e.g., Zod/Joi) which reduces scalability.
* Limited test coverage -> edge cases and failure scenarios are not fully covered.
* Queries are functional but lack indexing and performance tuning for large-scale data.

## 8. What would I improve ?

* Implement **refresh token mechanism** for better session management
* Add **input validation layer** (Zod/Joi) for robust validation
* Introduce **rate limiting & security middleware**
* Improve **test coverage (edge cases, failure scenarios)**
* Add **indexes** on frequently queried fields (e.g., project_id, assignee_id, status)
---

