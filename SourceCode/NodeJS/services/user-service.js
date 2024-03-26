const db = require("../models");
const { BadRequest, NotFound, GeneralError } = require("../utils/errors");
const User = db.user;
require("dotenv").config();
const Long = require("mongodb").Long;
const bcrypt = require("bcrypt");
const errorCode = require("../constants/error-codes");
const saltRounds = 10;
const RegexEscape = require("regex-escape");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { uploadImage, deleteFile, moveImageFromTemp, deleteImageFromTemp } = require("../utils/image-upload.util");
const resetSecret = process.env.resetTokenSecret;
const expiresIn = "5m";
const socketUtil = require("../utils/socket-util");
const { logger } = require("../utils/logger.utils");
const s3ImageStorageBaseUrl = process.env.AWS_IMAGE_STORAGE_BASE_URL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

exports.uploadProfileImage = async (ctx) => {
  try {
    let response = await uploadImage(ctx)
      .then(() => {
        const fileKey = {
          profileImage: ctx.request.file.key.replace("image/temp/", ""),
        };
        return fileKey;
      })
      .catch((error) => {
        throw new BadRequest(error.message, error.errorCode);
      });
    return response;
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 500);
  }
};

//Delete image from temp folder in s3
exports.deleteImage = async (file) => {
  if (file) {
    await deleteImageFromTemp(file).catch((error) => {
      throw new BadRequest(error.message, error.errorCode);
    });
    return { message: "Image deleted successfully" };
  } else {
    throw new BadRequest("No File provided", 100);
  }
};

exports.userRegistration = async (requestBody) => {
  try {
    const { name, email, password, profileImage } = requestBody;
    const _id = Long.fromString(Math.floor(Math.random() * 1000).toString() + new Date().getTime().toString());
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    if (profileImage) {
      await moveImageFromTemp(profileImage, _id).catch((error) => {
        throw new BadRequest(error.message, error.errorCode);
      });
    }
    const user = new User({
      _id,
      name,
      password: hashedPassword,
      email,
      profileImage: profileImage ? `${s3ImageStorageBaseUrl}/${_id.toString()}/${profileImage}` : "",
    });
    let response = (await user.save()).toObject();
    response._id = String(response._id);
    delete response.password;
    return response;
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 500);
  }
};
exports.viewUserProfile = async (state) => {
  try {
    const userId = state.user.id;
    const response = await User.findOne({ _id: userId }).select("-password").lean();
    if (!response) {
      throw new NotFound("User not found", errorCode.User_not_found);
    }
    return response;
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 400);
  }
};

exports.toggleUserBlock = async (queryParams, currentUser) => {
  const { userId, status } = queryParams;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new NotFound("User not found", errorCode.User_not_found);
  }
  try {
    let response;
    const isBlocked = currentUser.blockedUsers.includes(userId);
    if (status === "0") {
      if (isBlocked) {
        await User.updateOne({ _id: currentUser._id }, { $pull: { blockedUsers: Long.fromString(userId) } });
        response = { message: "User unblocked successfully!" };
      } else {
        response = (() => {
          throw new BadRequest("User is already unblocked", errorCode.User_already_unblocked);
        })();
      }
    } else {
      if (isBlocked) {
        response = (() => {
          throw new BadRequest("User is already blocked", errorCode.User_already_blocked);
        })();
      } else {
        await User.updateOne({ _id: currentUser._id }, { $push: { blockedUsers: Long.fromString(userId) } });
        response = { message: "User blocked successfully!" };
      }
    }
    if (!response) {
      throw new GeneralError("An unexpected error has occurred");
    }
    return response;
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 500);
  }
};

exports.passwordChange = async (request, state) => {
  try {
    const userId = state.user.id;
    let hashPassword = "";
    let newHashPassword = "";
    const { currentPassword, newPassword } = request.body;
    await User.findById(userId).then((data) => {
      hashPassword = data.password;
    });
    let passwordTrue = await bcrypt.compare(currentPassword, hashPassword);
    if (passwordTrue) {
      await bcrypt
        .hash(newPassword, saltRounds)
        .then((hash) => {
          newHashPassword = hash;
        })
        .catch((err) => {
          console.error("Error in hashing password", err);
        });

      let updateBody = {
        password: newHashPassword,
      };
      await User.updateOne({ _id: userId }, { $set: updateBody });
      return { message: "Password changed successfully!" };
    } else {
      throw new BadRequest("Invalid Current Password", errorCode.Invalid_Current_Password);
    }
  } catch (error) {
    throw new BadRequest(error);
  }
};

//Search User
exports.findUsers = async (queryParams, user) => {
  let { size, keyword, createdAt, name, status } = queryParams;
  let page = queryParams.page ?? 1;
  let limit = size ? Number(size) : 10;
  let pageNumber = page ? Number(page) : 1;
  let sortParams = {};
  // let matchParams = { _id: { $nin: user.blockedUsers } };
  let matchParams = {};
  let docs = {};
  let result = {};
  let totalDocs = 0;
  let totalPages = 0;
  let skipValue = (pageNumber - 1) * limit;

  if (createdAt) {
    sortParams.createdAt = Number(createdAt);
  } else if (name) {
    sortParams.name = Number(name);
  } else if (status) {
    sortParams.status = Number(status);
  } else sortParams.createdAt = -1;
  if (keyword) {
    const keywordInt = parseInt(keyword);
    matchParams.$or = [
      { name: { $regex: RegexEscape(keyword), $options: "i" } },
      { email: { $regex: RegexEscape(keyword), $options: "i" } },
      { _id: isNaN(keywordInt) ? null : keywordInt },
    ];
  }

  try {
    const aggregationPipeline = [
      { $match: matchParams },
      {
        $facet: {
          docs: [
            {
              $project: {
                _id: 1,
                name: 1,
                phoneNo: 1,
                email: 1,
                createdAt: 1,
                updatedAt: 1,
                profileImage: 1,
                status: 1,
                socketId: 1,
                currentStatus: 1,
              },
            },
            { $skip: skipValue },
            { $limit: limit },
          ],
          pagination: [{ $count: "totalDocs" }, { $addFields: { page: pageNumber } }],
        },
      },
    ];
    if (Object.keys(sortParams).length !== 0) aggregationPipeline.splice(1, 0, { $sort: sortParams });
    const record = await User.aggregate(aggregationPipeline);

    docs = record[0].docs;
    if (docs.length === 0) {
      docs = [];
      result = { docs, totalPages: 0 };
    } else {
      docs.forEach((record) => {
        record._id = record._id.toString();
      });
      totalDocs = record[0].pagination[0].totalDocs;
      totalPages = Math.ceil(totalDocs / limit);
      result = {
        docs,
        page: pageNumber,
        docsInPage: docs.length,
        totalPages: totalPages,
        totalDocs: totalDocs,
      };
    }
    return result;
  } catch (error) {
    throw new BadRequest(`An unexpected error has occurred while finding. Error: ${error}`, 400);
  }
};

exports.forgotPasswordMail = async (request) => {
  let email = request.body.email;
  let emailData = await User.findOne({ email }).select("_id, name");

  if (emailData) {
    let userName = emailData.name;
    let token = jwt.sign({ userId: emailData._id.toString() }, resetSecret, {
      expiresIn: expiresIn,
    });
    emailData.passwordTempToken = token;
    await emailData.save();
    let link = "http://sling.innovaturelabs.com/reset-password?token=" + token;
    let message =
      "<p>Hi " +
      userName +
      ',</p><p>Please click on the link below to reset your password.</p><a href="' +
      link +
      '">Reset password</a><p>P.S: Do not share this mail with anybody else';

    // email message options
    let mailOptions = {
      from: "suchitra.nair59@gmail.com",
      to: email,
      subject: "Reset your password",
      html: message,
    };

    await transporter.sendMail(mailOptions).catch((err) => {
      logger.error(`Email could not be sent to address: ${email} due to an error. Error: ${err}`);
      throw new GeneralError("An unexpected error has occurred while sending mail", errorCode.Sending_Failed);
    });

    return {
      message: "Successfully send mail. Please check your mail Inbox",
    };
  } else {
    throw new BadRequest("User with this email doesn't exist", errorCode.User_doesnt_exist);
  }
};

exports.passwordReset = async (request) => {
  let userId;
  const { resetToken, newPassword } = request.body;

  let payload = jwt.verify(resetToken, resetSecret, function (error, decoded) {
    return decoded ? decoded : null;
  });
  if (!payload) {
    throw new BadRequest("This token is not valid or has expired", errorCode.Link_expired);
  }
  const user = await User.findOne({ _id: Long.fromString(payload.userId) });
  if (resetToken !== user.passwordTempToken) {
    throw new BadRequest("This token is not valid or has expired", errorCode.Link_expired);
  }

  let newHashPassword;

  await bcrypt
    .hash(newPassword, saltRounds)
    .then((hash) => {
      newHashPassword = hash;
    })
    .catch((err) => {
      console.log("Error in hashing password", err);
    });
  user.password = newHashPassword;
  user.passwordTempToken = "";
  await user.save();
  return { message: "Password changed successfully!" };
};

exports.getConnectedUsers = async () => {
  const connectedUsers = socketUtil.getConnectedUsers();
  const userIds = Object.keys(connectedUsers).map((userId) => Long.fromString(userId.toString()));
  const connectedUserDetails = await User.find({ _id: { $in: userIds } })
    .select("_id name email")
    .lean();
  return connectedUserDetails;
};

//Delete image from user's path and db
exports.deleteProfileImage = async (state) => {
  try {
    const userId = state.user.id;
    const userRecord = await User.findOne({ _id: userId });
    if (userRecord.profileImage != "") {
      const response = await deleteFile(userRecord.profileImage);
      if (response) {
        const updateResponse = await User.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              profileImage: "",
            },
          }
        );
        if (!updateResponse) {
          let error = new Error("Some error occurred while updating db!");
          error.errorCode = errorCode.Unexpected_error;
          throw error;
        } else {
          return { message: "Deleted!" };
        }
      }
    } else {
      let error = new Error("File not found!");
      error.errorCode = errorCode.Profile_image_not_found_in_db;
      throw error;
    }
  } catch (error) {
    throw new BadRequest(error.message, error.errorCode);
  }
};

exports.updateProfileImage = async (ctx, next) => {
  try {
    const userId = ctx.state.user.id;
    const userRecord = await User.findOne({ _id: userId });
    if (userRecord.profileImage != "") {
      await deleteFile(userRecord.profileImage);
    }
    let response = await uploadImage(ctx)
      .then(async () => {
        const fileKey = {
          profileImage: ctx.request.file.key.replace("image/temp/", ""),
        };
        await moveImageFromTemp(fileKey.profileImage, userId);
        const updateResponse = await User.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              profileImage: `${s3ImageStorageBaseUrl}/${userRecord._id.toString()}/${fileKey.profileImage}`,
            },
          }
        );
        if (!updateResponse) {
          let error = new Error("Some error occurred while updating db!");
          error.errorCode = errorCode.Unexpected_error;
          throw error;
        } else {
          return { message: "Updated!" };
        }
      })
      .catch((error) => {
        throw error;
      });
    return response;
  } catch (error) {
    throw new BadRequest(error.message, error.errorCode);
  }
};

exports.updateProfile = async (ctx, next) => {
  try {
    const userId = ctx.state.user.id;
    let updateBody = {
      name: ctx.request.body.name,
      email: ctx.request.body.email,
    };
    const existingEmail = await User.findOne({ _id: { $ne: userId }, email: updateBody.email });
    if (existingEmail) {
      throw new BadRequest("Email already Exists", errorCode.Email_already_exists);
    }
    if (ctx.request.body.phoneNo) {
      updateBody.phoneNo = Number(ctx.request.body.phoneNo);
    }

    let response = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: updateBody,
      }
    );
    if (response) {
      return { message: "Profile updated successfully." };
    } else {
      throw new Error("Failed to update details!");
    }
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 400);
  }
};
