const db = require("../models");
const app = require("../app");
const request = require("supertest");
const Long = require("mongodb").Long;
const User = db.user;
const Group = db.group;
let token = global.accessToken;
let currentUserId = global.userId;
let server;
const bcrypt = require("bcrypt");

const errorCode = require("../constants/error-codes");
const { log } = require("winston");

beforeAll(async () => {
  await db.mongoose.connect(db.url);
  server = app.listen();
});
afterAll(async () => {
  await db.mongoose.disconnect();
  server.close();
});

describe("create group", () => {
  let testUser1;
  beforeEach(async () => {
    testUser1 = await User.create({
      _id: 123,
      name: "testUser1",
      email: "test1@gmail.com",
      password: "password",
    });
  });
  afterEach(async () => {
    await User.deleteMany({ name: { $in: ["testUser1"] } });
  });

  test("should return error when group name not provided", async () => {
    const response = await request(server).post("/api/group/").set("Authorization", token).send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Group name required",
        error_Code: 7000,
      },
    });
  });

  test("should return error when group members not provided", async () => {
    const response = await request(server).post("/api/group/").set("Authorization", token).send({
      name: "Test",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Members array required",
        error_Code: 7015,
      },
    });
  });

  test("should create new group", async () => {
    const response = await request(server)
      .post("/api/group/")
      .set("Authorization", token)
      .send({
        name: "Test",
        members: [testUser1._id.toString()],
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("name", "Test");
    expect(response.body).toHaveProperty("members");
    expect(response.body.members).toHaveLength(2);
    expect(response.body.members[0].memberId).toEqual(Number(currentUserId));
    expect(response.body.members[1].memberId).toEqual(Number(testUser1._id));
  });
});

describe("Add members in group", () => {
  let testGroup1;
  let testUser1;
  beforeEach(async () => {
    testGroup1 = await Group.create({
      _id: Long.fromString("123"),
      name: "testGroup1",
      members: [{ memberId: Long.fromString(currentUserId), memberType: 1 }],
    });
    testUser1 = await User.create({
      _id: Long.fromString("1234"),
      name: "testUser1",
      email: "test1@gmail.com",
      password: "password",
    });
  });
  afterEach(async () => {
    await Group.deleteMany({ _id: 123 });
    await User.deleteMany({ _id: Long.fromString("1234") });
  });

  test("should return array if members array is not given", async () => {
    const response = await request(server)
      .post(`/api/group/${testGroup1._id.toString()}/member`)
      .set("Authorization", token)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Members array required",
        error_Code: 7015,
      },
    });
  });

  test("Should return status 200 if input given correctly", async () => {
    const response = await request(server)
      .post(`/api/group/${testGroup1._id.toString()}/member`)
      .set("Authorization", token)
      .send({
        members: [testUser1._id.toString()],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.members.at(-1).memberId.toString()).toEqual(testUser1._id.toString());
    expect(response.body.members.at(-1).memberType).toEqual(0);
    expect(response.body.members.at(-1)).toHaveProperty("addedDate");
  });
});

describe("sendMessageInGroup", () => {
  let sampleGroup;
  let firstTestUser;
  let secondTestUser;

  beforeEach(async () => {
    firstTestUser = await User.create({
      _id: Long.fromString("123"),
      name: "firstTestUser",
      email: "test1@gmail.com",
      password: "password",
      isTest: true
    });
    secondTestUser = await User.create({
      _id: Long.fromString("567"),
      name: "secondTestUser",
      email: "test2@gmail.com",
      password: "password",
      isTest: true
    });

    sampleGroup = await Group.create({
      _id: Long.fromString("8910"),
      name: "sampleGroup",
      members: [
        { memberId: firstTestUser._id.toString() },
        { memberId: secondTestUser._id.toString() }
      ],
      isTest: true
    });
  });

  afterEach(async () => {
    await Group.deleteMany({ isTest: true });
    await User.deleteMany({ isTest: true });
  });

  test("should return status 200 if input is valid", async () => {
    const response = await request(server)
      .patch(`/api/group/message`)
      .set("Authorization", token)
      .send({
        id: sampleGroup._id.toString(),
        body: "This is a test message"
      });
    expect(response.statusCode).toBe(200);
  });

  test("should return error when ID is missing", async () => {
    const response = await request(server)
      .patch("/api/group/message")
      .set("Authorization", token)
      .send({
        body: "This is a test message"
      });
    expect(response.statusCode).toBe(404);
  });

  test("should return error when message body is missing", async () => {
    const response = await request(server)
      .patch("/api/group/message")
      .set("Authorization", token)
      .send({
        id: sampleGroup._id.toString()
      });
    expect(response.statusCode).toBe(404);
  });
  test("should return error when ID is not a string", async () => {
    const response = await request(server)
      .patch("/api/group/message")
      .set("Authorization", token)
      .send({
        id: 123,
        body: "This is a test message"
      });
    expect(response.statusCode).toBe(404);
  });
  test("should return error when body is not a string", async () => {
    const response = await request(server)
      .patch("/api/group/message")
      .set("Authorization", token)
      .send({
        id: sampleGroup._id.toString(),
        body: 123459205
      });

    expect(response.statusCode).toBe(404);
  });

});

//Edit message in group

describe("editMessageInGroup", () => {

  let sampleGroup;
  let firstTestUser;
  let secondTestUser;
  let accessToken;

  beforeEach(async () => {
    firstTestUser = await User.create({
      _id: Long.fromString("123"),
      name: "firstTestUser",
      email: "test1@gmail.com",
      password: await bcrypt.hash("password", 10),
      isTest: true
    });
    secondTestUser = await User.create({
      _id: Long.fromString("567"),
      name: "secondTestUser",
      email: "test2@gmail.com",
      password: await bcrypt.hash("password", 10),
      isTest: true
    });

    sampleGroup = await Group.create({
      _id: Long.fromString("8910"),
      name: "sampleGroup",
      members: [
        { memberId: firstTestUser._id.toString() },
        { memberId: secondTestUser._id.toString() }
      ],
      message: [
        {
          _id: "MSG372874631587",
          sender: firstTestUser._id.toString(),
          body: "This is test message"
        }
      ],
      isTest: true
    });
    const messageId = sampleGroup.message[0]._id;

  });

  afterEach(async () => {
    await Group.deleteMany({ isTest: true });
    await User.deleteMany({ isTest: true });
  });



  test("should return status 200 if input is valid", async () => {
    const messageId = sampleGroup.message[0]._id;
    const loginResponse = await request(server)
      .post("/api/login")
      .send({
        email: firstTestUser.email,
        password: "password",
      });

    accessToken = "SLING " + loginResponse.body.token;

    const response = await request(server)
      .put(`/api/group/message`)
      .set("Authorization", accessToken)
      .send({
        groupId: sampleGroup._id.toString(),
        messageId: messageId,
        message: "Testing"
      });


    expect(response.statusCode).toBe(200);


  });
})