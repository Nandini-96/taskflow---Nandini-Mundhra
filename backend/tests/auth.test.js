import request from "supertest";
import app from "../src/App.js";

describe("Auth API", () => {
  it("should register user", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test",
      email: "test@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
  });
});

it("should login user", async () => {
  const res = await request(app).post("/auth/login").send({
    email: "test@example.com",
    password: "123456",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.access_token).toBeDefined();
});

it("should create project", async () => {
  const login = await request(app).post("/auth/login").send({
    email: "test@example.com",
    password: "123456",
  });

  const token = login.body.access_token;

  const res = await request(app)
    .post("/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Test Project",
    });

  expect(res.statusCode).toBe(201);
});