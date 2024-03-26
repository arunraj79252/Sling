const app = require("../app");
const request = require("supertest");
const db = require("../models");
const bcrypt = require("bcrypt");
const Long = require("mongodb").Long;

exports.mockLogin = async () => {
  try {
    let server = app.listen();
    await db.mongoose.connect(db.url);
    const testUser = await db.user.findOneAndUpdate(
      { _id: Long.fromString("99999"), email: "jest@jest.com" },
      { $set: { email: "jest@jest.com", password: await bcrypt.hash("password", 10) } },
      { upsert: true, new: true }
    );
    const loginResponse = await request(server).post("/api/login").send({
      email: testUser.email,
      password: "password",
    });
    await db.mongoose.disconnect();
    server.close();
    return { accessToken: "SLING " + loginResponse.body.token, userId: loginResponse.body.userId };
  } catch (error) {
    console.log(error);
    return {
      accessToken: null,
    };
  }
};
