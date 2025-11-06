const request = require("supertest");
const express = require("express");
const authRoutes = require("../../routes/authenticateRoutes");
const { query } =  require("../../config/db.js");


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

    console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created successfully");
    expect(query).toHaveBeenCalledTimes(2);
  });
});

