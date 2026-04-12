import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";

describe("Auth + Project API", () => {
  let token;
  const email = `test${Date.now()}@example.com`; //unique email

  it("should register user", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test",
      email,
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
  });

  it("should login user", async () => {
    const res = await request(app).post("/auth/login").send({
      email,
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.access_token).toBeDefined();

    token = res.body.access_token; //save token
  });

  it("should create project", async () => {
    const res = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Project",
      });

    expect(res.statusCode).toBe(201);
  });
});

//close DB connection
afterAll(async () => {
  await pool.end();
});