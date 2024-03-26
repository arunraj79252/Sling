const sampleImage = `${__dirname}/sampleImages/sampleImage.png`;
const highResImage = `${__dirname}/sampleImages/highResImage.jpg`;
const app = require("../app");
const request = require("supertest");
const fs = require("fs");
const db = require("../models");
const User = db.user;
const { deleteImage } = require("../services/user-service");
const errorCodes = require("../constants/error-codes");
let server;
let token = global.accessToken;
let currentUserId = global.userId;
const Long = require("mongodb").Long;

beforeAll(async () => {
  await db.mongoose.connect(db.url);
  server = app.listen();
});
afterAll(async () => {
  await db.mongoose.disconnect();
  server.close();
});

describe("uploadProfileImage", () => {
  test("should return 200 on proper image upload", async () => {
    const response = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .attach("profileImage", fs.readFileSync(sampleImage), "image.png");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("profileImage");

    const fileKey = response.body.profileImage;
    await deleteImage(fileKey);
  });

  test("should return error if image is not provided", async () => {
    const response = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .field("profileImage", "");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "File Required",
        error_Code: 2037,
      },
    });
  });

  test("should return content-type error if content-type not provided", async () => {
    const response = await request(server).patch("/api/user/profileImage").set("Authorization", token);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Please add proper content-type header for the request",
        error_Code: errorCodes.Invalid_content_type,
      },
    });
  });

  test("should return error if profileImage field is not provided", async () => {
    const response = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .set("Content-Type", "multipart/form-data; boundary=0");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "File Required",
        error_Code: 2037,
      },
    });
  });

  test("should return error if mutiple images are provided under same field", async () => {
    const response = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .attach("profileImage", fs.readFileSync(sampleImage), "image.png")
      .attach("profileImage", fs.readFileSync(sampleImage), "image.png");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Unexpected field",
        error_Code: 2036,
      },
    });
  });

  test("should return error if mutiple fields and images are provided", async () => {
    const response = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .attach("profileImage", fs.readFileSync(sampleImage), "image.png")
      .attach("profileImages", fs.readFileSync(sampleImage), "image.png");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Unexpected field",
        error_Code: 2036,
      },
    });
  });

  test("should return error if image with wrong format is provided", async () => {
    const response = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .attach("profileImage", fs.readFileSync(sampleImage), "image.mp4");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Only .png, .jpg and .jpeg format allowed",
        error_Code: 2033,
      },
    });
  });

  test("should return error if image with size above 5mb is provided", async () => {
    const response = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .attach("profileImage", fs.readFileSync(highResImage), "image.png");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "File too large",
        error_Code: 2035,
      },
    });
  }, 25000);
});

describe("deleteProfileImage", () => {
  test("should return 200 when deleting an uploaded file", async () => {
    const imageUploadResponse = await request(server)
      .patch("/api/user/profileImage")
      .set("Authorization", token)
      .attach("profileImage", fs.readFileSync(sampleImage), "image.png");

    const response = await request(server)
      .delete(`/api/user/profileImage/${imageUploadResponse.body.profileImage}`)
      .set("Authorization", token);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Image deleted successfully",
    });
  });

  test("should return error when trying to delete an invalid image", async () => {
    const response = await request(server).delete(`/api/user/profileImage/invalidImage`).set("Authorization", token);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Image does not exist in server",
        error_Code: 2032,
      },
    });
  });
});

describe("registerUser", () => {
  test("should return 200 on successful registration", async () => {
    await User.deleteMany({ name: "testUser" });
    const response = await request(server).post("/api/user").send({
      name: "testUser",
      password: "password",
      confirmPassword: "password",
      email: "testuser@test.com",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("name", "testUser");
    expect(response.body).toHaveProperty("email", "testuser@test.com");
    expect(response.body).toHaveProperty("status", 1);
    expect(response.body).toHaveProperty("isDisabled", 0);
    await User.deleteMany({ name: "testUser" });
  });

  describe("Name field validation", () => {
    it("should return error when name field is not given", async () => {
      const response = await request(server).post("/api/user").send({
        password: "password",
        confirmPassword: "password",
        email: "testuser@test.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Name required",
          error_Code: 2000,
        },
      });
    });

    it("should return error when name is given as empty string", async () => {
      const response = await request(server).post("/api/user").send({
        name: "",
        password: "password",
        confirmPassword: "password",
        email: "testuser@test.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Name required",
          error_Code: 2000,
        },
      });
    });

    it("should return error when name given has less than 2 characters", async () => {
      const response = await request(server).post("/api/user").send({
        name: "a",
        password: "password",
        confirmPassword: "password",
        email: "testuser@test.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Name should have at least 2 characters",
          error_Code: 2003,
        },
      });
    });

    it("should return error when name given has more than 60 characters", async () => {
      const response = await request(server).post("/api/user").send({
        name: "qwertyuiopasdfghjklzxcvbnmqwertyuiopasdhfxxdfjlkjabsdjbwwwwww",
        password: "password",
        confirmPassword: "password",
        email: "testuser@test.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Name should have at most 60 characters",
          error_Code: 2002,
        },
      });
    });

    it("should return error when name is given as integer", async () => {
      const response = await request(server).post("/api/user").send({
        name: 123,
        password: "password",
        confirmPassword: "password",
        email: "testuser@test.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Name should be string",
          error_Code: 2001,
        },
      });
    });

    it("should return error when entering invalid name", async () => {
      const response = await request(server).post("/api/user").send({
        name: "testUser1",
        password: "password",
        confirmPassword: "password",
        email: "testuser@test.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Name should contain only alphabets",
          error_Code: 2004,
        },
      });
    });
  });

  describe("Password field validation", () => {
    it("should return error when password field is not given", async () => {
      const response = await request(server).post("/api/user").send({
        name: "testUser",
        confirmPassword: "password",
        email: "testuser@passw.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Password required",
          error_Code: 2020,
        },
      });
    });

    it("should return error when password field given as empty string", async () => {
      const response = await request(server).post("/api/user").send({
        name: "testUser",
        password: "",
        confirmPassword: "password",
        email: "testuser@passw.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Password required",
          error_Code: 2020,
        },
      });
    });

    it("should return error when entering password with less than 6 characters", async () => {
      const response = await request(server).post("/api/user").send({
        name: "testUser",
        password: "passw",
        confirmPassword: "password",
        email: "testuser@passw.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Password should have at least 6 characters",
          error_Code: 2022,
        },
      });
    });

    it("should return error when entering password with more then 30 characters", async () => {
      const response = await request(server).post("/api/user").send({
        name: "testUser",
        password: "qwlehulvdlhsadhavsdhavdadhlavdh",
        confirmPassword: "password",
        email: "testuser@passw.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Password should have at most 30 characters",
          error_Code: 2023,
        },
      });
    });
  });

  describe("Confirm Password field validation", () => {
    it("should return error confirm password field is not given", async () => {
      const response = await request(server).post("/api/user").send({
        name: "testUser",
        password: "password",
        email: "testuser@passw.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Confirm Password required",
          error_Code: 2025,
        },
      });
    });

    it("should return error when entering password and confirm password do not match", async () => {
      const response = await request(server).post("/api/user").send({
        name: "testUser",
        password: "password",
        confirmPassword: "password1",
        email: "testuser@passw.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: {
          error: "Passwords do not match",
          error_Code: 2024,
        },
      });
    });
  });

  test("should return error when entering invalid email", async () => {
    const response = await request(server).post("/api/user").send({
      name: "testUser",
      password: "password",
      confirmPassword: "password",
      email: "testuser@passw.comm",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Invalid email",
        error_Code: 2011,
      },
    });
  });

  test("should return error when entering entering existing email", async () => {
    const existingUser = await User.create({
      _id: Long.fromString("8520"),
      name: "exisingUser",
      email: "existingUser@email.com",
    });
    const response = await request(server).post("/api/user").send({
      name: "testUser",
      password: "password",
      confirmPassword: "password",
      email: existingUser.email,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: {
        error: "Email already exists",
        error_Code: 2013,
      },
    });
    await User.deleteMany({ _id: existingUser._id });
  });
});
