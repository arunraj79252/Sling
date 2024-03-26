const Joi = require("joi");
const jwt = require("jsonwebtoken");
const db = require("../models");
const errorCode = require("../constants/error-codes");
const Long = require("mongodb").Long;
const User = db.user;

const userValidator = {
  //Registration
  registration: Joi.object({
    name: Joi.string()
      .pattern(/^[a-zA-Z\s]+$/)
      .min(2)
      .max(60)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Name required";
              err.code = errorCode.Name_required;
              break;
            case "string.base":
              err.message = "Name should be string";
              err.code = errorCode.Name_not_string;
              break;
            case "string.pattern.base":
              err.message = "Name should contain only alphabets";
              err.code = errorCode.Name_should_contain_only_alphabets;
              break;
            case "string.min":
              err.message = `Name should have at least ${err.local.limit} characters`;
              err.code = errorCode.Name_too_short;
              break;
            case "string.max":
              err.message = `Name should have at most ${err.local.limit} characters`;
              err.code = errorCode.Name_too_long;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    password: Joi.string()
      .min(6)
      .max(30)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Password required";
              err.code = errorCode.Password_required;
              break;
            case "string.base":
              err.message = "Password should be string";
              err.code = errorCode.Password_not_string;
              break;
            case "string.min":
              err.message = `Password should have at least ${err.local.limit} characters`;
              err.code = errorCode.Password_too_short;
              break;
            case "string.max":
              err.message = `Password should have at most ${err.local.limit} characters`;
              err.code = errorCode.Password_too_long;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    confirmPassword: Joi.valid(Joi.ref("password"))
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Confirm Password required";
              err.code = errorCode.Confirm_password_required;
              break;
            case "any.only":
              err.message = "Passwords do not match";
              err.code = errorCode.Passwords_do_not_match;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    email: Joi.string()
      .email()
      .pattern(/^[\w-@.]+$/)
      .required()
      .external(async (value) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Joi.ValidationError("Email already exists", [
            {
              message: "Email already exists",
              type: errorCode.Email_already_exists,
            },
          ]);
        } else return value;
      })
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Email required";
              err.code = errorCode.Email_required;
              break;
            case "string.base":
              err.message = "Email should be string";
              err.code = errorCode.Email_not_string;
              break;
            case "string.pattern.base":
            case "string.email":
              err.message = "Invalid email";
              err.code = errorCode.Email_invalid;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    profileImage: Joi.string()
      .empty()
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "string.empty":
              err.message = "Profile Image should not be empty";
              err.code = errorCode.Profile_image_should_not_be_empty;
              break;
            case "string.base":
              err.message = "Profile Image should be string";
              err.code = errorCode.Profile_image_should_be_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  //Login
  login: Joi.object({
    email: Joi.string()
      .email()
      .pattern(/^[\w-@.]+$/)
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "Email required";
              err.code = errorCode.Email_required;
              break;
            case "string.empty":
              err.message = "Email should not be empty";
              err.code = errorCode.Email_should_not_be_Empty;
              break;
            case "string.base":
              err.message = "Email should be string";
              err.code = errorCode.Email_not_string;
              break;
            case "string.pattern.base":
              err.message = "Email invalid";
              err.code = errorCode.Email_invalid;
              break;
            case "string.email":
              err.message = "Invalid email address";
              err.code = errorCode.Email_invalid;

              break;
            default:
              break;
          }
        });
        return errors;
      }),

    password: Joi.string()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Password required";
              err.code = errorCode.Password_required;
              break;
            case "string.base":
              err.message = "Password should be string";
              err.code = errorCode.Password_not_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  //Refresh Token
  refreshToken: Joi.object({
    Token: Joi.string()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Refresh Token required";
              err.code = errorCode.RefreshToken_required;
              break;
            case "string.base":
              err.message = "Refresh Token should be string";
              err.code = errorCode.Invalid_refreshToken;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  //Change password
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "Current Password required";
              err.code = errorCode.currentPassword_required;
              break;
            case "string.empty":
              err.message = "Current Password should not be empty";
              err.code = errorCode.currentPassword_empty;
              break;
            case "string.base":
              err.message = "Current Password should be string";
              err.code = errorCode.currentPassword_not_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    newPassword: Joi.string()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "New Password required";
              err.code = errorCode.Password_required;
              break;
            case "string.empty":
              err.message = "New Password should not be empty";
              err.code = errorCode.Password_empty;
              break;
            case "string.base":
              err.message = "New Password should be string";
              err.code = errorCode.CPassword_not_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  //Block/Unblock
  blockUnblockUser: Joi.object({
    userId: Joi.string()
      .empty()
      .pattern(/^\d+$/)
      .required()
      .external(async (value) => {
        const user = await User.findOne({ _id: Long.fromString(value) });
        if (!user) {
          throw new Joi.ValidationError("User with given ID not found", [
            {
              message: "User with given ID not found",
              type: errorCode.User_not_found,
            },
          ]);
        } else return value;
      })
      .external(async (value, helpers) => {
        const token = helpers.prefs.accessToken.replace("SLING ", "");
        const decodedToken = jwt.decode(token);
        if (value === decodedToken.userId)
          throw new Joi.ValidationError("UserId cannot be same as current user", [
            {
              message: "UserId cannot be same as current User",
              type: errorCode.UserId_same_as_user,
            },
          ]);
        else return value;
      })
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "UserId required";
              err.code = errorCode.UserId_required;
              break;
            case "string.pattern.base":
              err.message = "UserId should contain only numeric values";
              err.code = errorCode.UserId_not_number;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    status: Joi.string()
      .empty(false)
      .valid("0", "1")
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Status required";
              err.code = errorCode.Status_required;
              break;
            case "any.only":
              err.message = "Status should be either 0 or 1";
              err.code = errorCode.Invalid_status;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  //Search User
  getUsersValidator: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Page parameter should be an number";
              err.code = errorCode.Invalid_page_Number;
              break;
            case "number.integer":
              err.message = "Page parameter should be an Integer";
              err.code = errorCode.Page_Parameter_shouldbe_Integer;
              break;
            case "number.min":
              err.message = "Page parameter should start with 1";
              err.code = errorCode.Invalid_page_Number;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    size: Joi.number()
      .integer()
      .min(1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Size parameter should be a number";
              err.code = errorCode.Invalid_page_size;
              break;
            case "number.integer":
              err.message = "Size parameter should be an Integer";
              err.code = errorCode.Size_Parameter_shouldbe_Integer;
              break;
            case "number.min":
              err.message = "Size parameter should start with 1";
              err.code = errorCode.Invalid_page_size;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    status: Joi.number()
      .valid(1, -1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Sorting parameter should be a number";
              err.code = errorCode.Sorting_parameter_should_be_a_number;
              break;
            case "any.only":
              err.message = "Status parameter should be 1 or -1";
              err.code = errorCode.Invalid_Status;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    name: Joi.number()
      .valid(1, -1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Sorting parameter should be a number";
              err.code = errorCode.Sorting_parameter_should_be_a_number;
              break;
            case "any.only":
              err.message = "Name parameter should be 1 or -1";
              err.code = errorCode.Invalid_name;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    createdAt: Joi.number()
      .valid(1, -1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Sorting parameter should be a number";
              err.code = errorCode.Sorting_parameter_should_be_a_number;
              break;

            case "any.only":
              err.message = "Created At parameter should be 1 or -1";
              err.code = errorCode.Invalid_createdAt;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    keyword: Joi.string()
      .trim()
      .allow("")
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "string.base":
              err.message = "Seach keyword must be string";
              err.code = errorCode.Search_keyword_must_be_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  forgotPasswordMail: Joi.object({
    email: Joi.string()
      .email()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Email is required";
              err.code = errorCode.Email_required;
              break;
            case "string.base":
              err.message = "Email should be string";
              err.code = errorCode.Email_not_string;
              break;
            case "string.email":
              err.message = "Invalid email address";
              err.code = errorCode.Email_invalid;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  resetPassword: Joi.object({
    resetToken: Joi.string()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Reset token required";
              err.code = errorCode.Reset_token_required;
              break;
            case "string.base":
              err.message = "Reset Token should be string";
              err.code = errorCode.Reset_token_not_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    newPassword: Joi.string()
      .min(6)
      .max(30)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "New Password required";
              err.code = errorCode.Password_required;
              break;
            case "string.base":
              err.message = "New Password should be string";
              err.code = errorCode.Password_not_string;
              break;
            case "string.min":
              err.message = `New Password should have at least ${err.local.limit} characters`;
              err.code = errorCode.Password_too_short;
              break;
            case "string.max":
              err.message = `New Password should have at most ${err.local.limit} characters`;
              err.code = errorCode.Password_too_long;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    confirmPassword: Joi.valid(Joi.ref("newPassword"))
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Confirm Password required";
              err.code = errorCode.Confirm_password_required;
              break;
            case "any.only":
              err.message = "Passwords do not match";
              err.code = errorCode.Passwords_do_not_match;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  //google login
  googleSignIn: Joi.object({
    code: Joi.string()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Code  required";
              err.code = errorCode.Code_required;
              break;
            case "string.base":
              err.message = "Code should be string";
              err.code = errorCode.Invalid_code;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  editProfile: Joi.object({
    name: Joi.string()
      .pattern(/^[a-zA-Z]+$/)
      .min(2)
      .max(60)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "Name required";
              err.code = errorCode.Name_required;
              break;
            case "string.empty":
              err.message = "Name can't be  empty";
              err.code = errorCode.userName_should_not_be_empty;
              break;
            case "string.base":
              err.message = "Name should be string";
              err.code = errorCode.Name_not_string;
              break;
            case "string.pattern.base":
              err.message = "Name should contain only alphabets";
              err.code = errorCode.Name_should_contain_only_alphabets;
              break;
            case "string.min":
              err.message = `Name should have at least ${err.local.limit} characters`;
              err.code = errorCode.Name_too_short;
              break;
            case "string.max":
              err.message = `Name should have at most ${err.local.limit} characters`;
              err.code = errorCode.Name_too_long;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    email: Joi.string()
      .email()
      .pattern(/^[\w-@.]+$/)
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "Email required";
              err.code = errorCode.Email_required;
              break;
            case "string.empty":
              err.message = "Email can't be empty";
              err.code = errorCode.Email_should_not_be_Empty;
              break;
            case "string.base":
              err.message = "Email should be string";
              err.code = errorCode.Email_not_string;
              break;
            case "string.pattern.base":
            case "string.email":
              err.message = "Invalid email";
              err.code = errorCode.Email_invalid;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    phoneNo: Joi.string()
      .pattern(/^\d+$/)
      .length(10)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "string.base":
              err.message = "Phone number  should be String";
              err.code = errorCode.Phone_number_should_be_string;
              break;
            case "string.pattern.base":
              err.message = "Phone number should contain only numbers";
              err.code = errorCode.Phone_number_should_contain_only_numbers;
              break;
            case "string.length":
              err.message = "Invalid Phone number!";
              err.code = errorCode.Invalid_phone_number;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),
};

module.exports = { userValidator };
