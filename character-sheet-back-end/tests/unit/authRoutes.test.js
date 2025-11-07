const request = require("supertest");
const express = require("express");
const authRoutes = require("../../routes/authenticateRoutes");
const { query } = require("../../config/db.js");


// mock database connection
jest.mock("../../config/db.js", () => ({
  query: jest.fn(),
}));


// create express server
const app = express();
app.use(express.json());
app.use("/", authRoutes);

describe("POST /api/register route", () => {
  beforeEach(() => jest.clearAllMocks());

  test("creates a new user successfully", async () => {
    // mock no existing users
    query
      // check that no user exists
      .mockResolvedValueOnce([[]])
      //insert user into database
      .mockResolvedValueOnce([{ insertId: 1 }]); // INSERT - user created


    const res = await request(app).post("/api/register").send({
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "Password123",
      securityAnswer: "Testing"
    });

    // console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created successfully");
    expect(query).toHaveBeenCalledTimes(2);
  });
});

describe("POST /api/login route", () => {
  beforeEach(() => jest.clearAllMocks());

  test("logs in a user successfully", async () => {
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    // mocks bcrypt to return true and mocks jwt to return a mock token
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    jest.spyOn(jwt, "sign").mockReturnValue("mock-token");

    // mocks database to return a user with hashed password
    query.mockResolvedValueOnce([[
      {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password_hash: "hashedPa$$word"
      }
    ]]);

    const res = await request(app).post("/api/login").send({
      email: "test@example.com",
      password: "Password123"
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.token).toBe("mock-token");
  });

  test("returns 400 if email or password is missing", async () => {
    const res = await request(app).post("/api/login").send({
      email: "",
      password: "12345678"
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email and password are required.");
  });
});


