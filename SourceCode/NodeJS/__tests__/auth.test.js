const db = require("../models");
const app = require("../app");
const request = require("supertest");
const User = db.user;
const bcrypt = require("bcrypt");
const Long = require("mongodb").Long;
let server;
beforeAll(async () => {
  await db.mongoose.connect(db.url);
  server = app.listen();
});
afterAll(async () => {
  // closeSocket()
  await db.mongoose.disconnect();
  server.close();
});

describe("Login", () => {
  let testUser1;
  beforeEach(async () => {
    let password = await bcrypt.hash("password", 10);
    testUser1 = await User.create({
      _id: Long.fromString("1"),
      name: "jest-test",
      email: "jest-test@gmail.com",
      password,
      profileImage: "",
    });
  });
  afterEach(async () => {
    await User.deleteMany({ _id: testUser1._id });
  });
  test("should return 200 on right credentials", async () => {
    const response = await request(server).post("/api/login").send({
      email: "jest-test@gmail.com",
      password: "password",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "Success");
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");
    expect(response.body).toHaveProperty("email", "jest-test@gmail.com");
    expect(response.body).toHaveProperty("userName", "jest-test");
    expect(response.body).toHaveProperty("userId", "1");
    expect(response.body).toHaveProperty("profileImage");
  });
  test("should return error on wrong credentials", async () => {
    const response = await request(server).post("/api/login").send({
      email: "jest-test@gmail.com",
      password: "password1",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Incorrect username or password",
        error_Code: 5001,
      },
    });
  });

  test("should return error on invalid email", async () => {
    const response = await request(server).post("/api/login").send({
      email: "jest-test",
      password: "password",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Invalid email address",
        error_Code: 2011,
      },
    });
  });

});
