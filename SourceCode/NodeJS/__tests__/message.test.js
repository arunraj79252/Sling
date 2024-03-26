const db = require("../models");
const app = require("../app");
const request = require("supertest");
const User = db.user;
const Long = require("mongodb").Long;
const socket = require("../utils/socket-util");
let server;
let token = global.accessToken;
let currentUserId = global.userId;
let messageUser1;

beforeAll(async () => {
  await db.mongoose.connect(db.url);
  server = app.listen();
  messageUser1 = await User.create({
    _id: Long.fromString("1111"),
    name: "messageUser1",
    email: "test1@gmail.com",
    password: "password",
  });
});
afterAll(async () => {
  // closeSocket()
  await User.deleteMany({ _id: messageUser1._id });

  await db.mongoose.disconnect();
  server.close();
});

describe("sendMessage", () => {
  beforeEach(async () => {});

  afterEach(async () => {});

  test("should return error if recipient ID not given", async () => {
    const response = await request(server).post("/api/message").set("Authorization", token).send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Recipient ID required",
        error_Code: 6050,
      },
    });
  });

  test("should return error message field not given", async () => {
    const response = await request(server)
      .post("/api/message")
      .set("Authorization", token)
      .send({ recipientId: currentUserId });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Message required",
        error_Code: 6053,
      },
    });
  });
  test("should return 200 if correct input provided", async () => {
    const message = "test message";
    const response = await request(server)
      .post("/api/message")
      .set("Authorization", token)
      .send({ recipientId: messageUser1._id.toString(), message });
    expect(response.statusCode).toBe(200);
    expect(response.body.members).toContain(Number(currentUserId), Number(messageUser1._id));
    expect(response.body.message.at(-1)).toHaveProperty("sender", Number(currentUserId));
    expect(response.body.message.at(-1)).toHaveProperty("body", message);
  });
});
