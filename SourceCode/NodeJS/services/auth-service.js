const Long = require("mongodb").Long;
const db = require("../models");
const { BadRequest, Unauthorized } = require("../utils/errors");
const User = db.user;
require("dotenv").config();
const tokenConfig = require("../config/token.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const errorCode = require("../constants/error-codes");

exports.userLogin = async (requestBody) => {
  const { email, password } = requestBody;
  let user = await User.findOne({ email: email });

  if (!user) {
    throw new Unauthorized("Incorrect username or password", errorCode.Invalid_userName_or_password);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Unauthorized("Incorrect username or password", errorCode.Invalid_userName_or_password);
  }

  const { token, refreshToken } = generateUserTokens(user._id, user.email);
  let responseData = {
    status: "Success",
    token,
    refreshToken,
    email: user.email,
    userName: user.name,
    userId: user._id.toString(),
    profileImage: user.profileImage,
  };
  return responseData;
};

//To generate token

function generateUserTokens(id, email) {
  const token = jwt.sign(
    {
      _id: id.toString(),
    },
    process.env.userAccessTokenSecret,
    {
      expiresIn: tokenConfig.userAccessTokenExpiry,
    }
  );
  const refreshToken = jwt.sign(
    {
      email: email,
    },
    process.env.userRefreshTokenSecret,
    {
      expiresIn: tokenConfig.userRefreshTokenExpiry,
    }
  );
  return { token, refreshToken };
}

//Refresh token
exports.userRefreshToken = async (requestBody) => {
  try {
    const { Token } = requestBody;
    if (!Token) {
      throw new BadRequest("No refresh token provided.", errorCode.RefreshToken_empty);
    }
    const refreshTokenUser = checkUserRefreshTokenValidity(Token);
    if (!refreshTokenUser.email) {
      throw new BadRequest("Invalid refresh token.", errorCode.Invalid_refreshToken);
    }
    let user = await User.findOne({ email: refreshTokenUser.email });
    if (!user) {
      throw new Unauthorized("No user found", errorCode.User_not_Found);
    }
    const { token, refreshToken } = generateUserTokens(user._id, user.email);
    let responseData = {
      status: "Success",
      token,
      refreshToken,
      email: user.email,
      socketId: user.socketId,
      userName: user.name,
      userId: user._id.toString(),
      profileImage: user.profileImage,
    };
    return responseData;
  } catch (err) {
    throw new BadRequest(err);
  }
};

//To check refresh token validity
function checkUserRefreshTokenValidity(token) {
  const data = jwt.verify(token, process.env.userRefreshTokenSecret, function (error, decoded) {
    return decoded ? decoded : error;
  });
  return data;
}

exports.googleAuthService = async (code) => {
  try {
    let responseData;
    const response = jwt.decode(code);
    if (response.email_verified) {
      const { name, email, picture } = response;
      const userExist = await User.findOne({ email: email });
      if (userExist) {
        let updateBody = {
          $set: {
            email: email,
            name: name,
            profileImage: picture,
          },
        };
        const updateResponse = await User.updateOne({ _id: userExist._id }, updateBody);
        if (updateResponse.modifiedCount) {
          const { token, refreshToken } = generateUserTokens(userExist._id, email);
          responseData = {
            status: "Success",
            token,
            refreshToken,
            email: userExist.email,
            socketId: userExist.socketId,
            userName: userExist.name,
            userId: userExist._id.toString(),
            profileImage: userExist.profileImage,
          };
        }
      } else {
        const _id = Long.fromString(Math.floor(Math.random() * 1000).toString() + new Date().getTime().toString());
        const user = new User({
          _id,
          name,
          email,
          profileImage: picture,
        });
        let userResponse = (await user.save()).toObject();
        if (userResponse) {
          const { token, refreshToken } = generateUserTokens(_id, email);
          responseData = {
            status: "Success",
            token,
            refreshToken,
            email: userResponse.email,
            socketId: userResponse.socketId,
            userName: userResponse.name,
            userId: userResponse._id.toString(),
            profileImage: userResponse.profileImage,
          };
        }
      }
    } else {
      throw new BadRequest("Email is not verified", errorCode.Email_not_verified);
    }
    return responseData;
  } catch (err) {
    throw new BadRequest(`An error has occurred while generating token.Error: ${err}`, err.error_code ?? 400);
  }
};
