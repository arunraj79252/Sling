const Joi = require("joi");
const errorCode = require("../constants/error-codes");
const messageValidator = {
  sendMessage: Joi.object({
    recipientId: Joi.string()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Recipient ID required";
              err.code = errorCode.Recipient_ID_required;
              break;
            case "string.base":
              err.message = "Recipient ID should be string";
              err.code = errorCode.Recipient_ID_not_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    message: Joi.string()
      .max(1000)
      .trim()
      .allow("")
      .exist()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "Message required";
              err.code = errorCode.Message_required;
              break;
            case "string.base":
              err.message = "Message should be string";
              err.code = errorCode.Message_not_string;
              break;
            case "string.max":
              err.message = `Message should not exceed ${err.local.limit} characters`;
              err.code = errorCode.Message_too_long;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),
  editMessage: Joi.object({
    messageId: Joi.string()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Message ID required";
              err.code = errorCode.Message_ID_required;
              break;
            case "string.base":
              err.message = "Message ID should be string";
              err.code = errorCode.Message_ID_should_be_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    message: Joi.string()
      .max(1000)
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Message required";
              err.code = errorCode.Message_required;
              break;
            case "string.base":
              err.message = "Message should be string";
              err.code = errorCode.Message_not_string;
              break;
            case "string.max":
              err.message = `Message should not exceed ${err.local.limit} characters`;
              err.code = errorCode.Message_too_long;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  viewMessage: Joi.object({
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
    id: Joi.string()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Recipient ID required";
              err.code = errorCode.Recipient_ID_required;
              break;
            case "string.base":
              err.message = "Recipient ID should  be string";
              err.code = errorCode.Recipient_ID_not_string;
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

  getMessages: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Page parameter should be a positive integer";
              err.code = errorCode.Invalid_page_Number;
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
              err.message = "Size parameter should be a positive integer";
              err.code = errorCode.Invalid_page_size;
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

  searchMessage: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Page parameter should be a positive integer";
              err.code = errorCode.Invalid_page_Number;
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

    limit: Joi.number()
      .integer()
      .min(1)
      .optional()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "number.base":
              err.message = "Size parameter should be a positive integer";
              err.code = errorCode.Invalid_page_size;
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

    keyword: Joi.string()
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Search keyword required";
              err.code = errorCode.Search_keyword_required;
              break;
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
};

module.exports = { messageValidator };
