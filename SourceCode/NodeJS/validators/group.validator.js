const Joi = require("joi");
const errorCode = require("../constants/error-codes");
const db = require("../models");
const Long = require("mongodb").Long;
const Users = db.user;
const groupValidator = {
  createGroup: Joi.object({
    name: Joi.string()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group name required";
              err.code = errorCode.Group_name_required;
              break;
            case "string.base":
              err.message = "Group name should be string";
              err.code = errorCode.Group_name_not_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    members: Joi.array()
      .items(Joi.string())
      .unique()
      .min(1)
      .max(49)
      .required()
      .external(async (value) => {
        if (!(await checkGroupMembersInDB(value))) {
          throw new Joi.ValidationError("User with given ID not found", [
            {
              message: "One or more users given in members does not exist.",
              type: errorCode.Group_members_id_does_not_exist,
            },
          ]);
        } else return value;
      })
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "array.base":
              err.message = "Members should be array";
              err.code = errorCode.Group_members_not_array;
              break;
            case "string.base":
              err.message = "Members array should contain only strings";
              err.code = errorCode.Group_members_should_contain_strings;
              break;
            case "array.max":
              err.message = `Total Members should not exceed 50`;
              err.code = errorCode.Group_members_max_limit_reached;
              break;
            case "array.min":
              err.message = `Atleast one member should be added`;
              err.code = errorCode.Group_members_should_be_more_than_one;
              break;
            case "array.unique":
              err.message = `Members array should not contain duplicate IDs`;
              err.code = errorCode.Group_members_contain_duplicate_values;
              break;
            case "any.required":
              err.message = `Members array required`;
              err.code = errorCode.Group_members_required;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    image: Joi.string()
      .trim()
      .empty()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "string.empty":
              err.message = "Group image should not be empty";
              err.code = errorCode.Group_name_required;
              break;
            case "string.base":
              err.message = "Group image should be string";
              err.code = errorCode.Group_image_should_be_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  editGroup: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "GroupID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.empty":
              err.message = "GroupID can't be empty";
              err.code = errorCode.Group_id_empty;
              break;
            case "string.base":
              err.message = "GroupID should be string";
              err.code = errorCode.Group_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    name: Joi.string()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group name required";
              err.code = errorCode.Group_name_required;
              break;
            case "string.base":
              err.message = "Group name should be string";
              err.code = errorCode.Group_name_not_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    image: Joi.string()
      .trim()
      .empty()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "string.empty":
              err.message = "Group image should not be empty";
              err.code = errorCode.Group_name_required;
              break;
            case "string.base":
              err.message = "Group image should be string";
              err.code = errorCode.Group_image_should_be_string;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  changeGroupAdmin: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "GroupID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.empty":
              err.message = "GroupID can't be empty";
              err.code = errorCode.Group_id_empty;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    memberId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "memberID required";
              err.code = errorCode.Member_ID_required;
              break;
            case "string.empty":
              err.message = "memberID can't be empty";
              err.code = errorCode.Member_ID_cannot_be_empty;
              break;
            case "string.pattern.base":
              err.message = "memberID should contain only numeric values";
              err.code = errorCode.Member_ID_not_number;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    memberType: Joi.string()
      .trim()
      .valid("1", "0")
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "memberType required";
              err.code = errorCode.Member_type_required;
              break;
            case "string.empty":
              err.message = "memberType can't be empty";
              err.code = errorCode.Member_type_cannot_be_empty;
              break;
            case "any.only":
              err.message = "MemberType should be either 0 or 1";
              err.code = errorCode.Member_type_invalid;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),
  addMembers: Joi.object({
    members: Joi.array()
      .required()
      .items(Joi.string())
      .min(1)
      .unique()
      .external(async (value) => {
        if (!(await checkGroupMembersInDB(value))) {
          throw new Joi.ValidationError("User with given ID not found", [
            {
              message: "One or more users given in members does not exist.",
              type: errorCode.Group_members_id_does_not_exist,
            },
          ]);
        } else return value;
      })
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "array.base":
              err.message = "Members should be array";
              err.code = errorCode.Group_members_not_array;
              break;
            case "string.base":
              err.message = "Members array should contain only strings";
              err.code = errorCode.Group_members_should_contain_strings;
              break;
            case "array.min":
              err.message = `Atleast one member should be added`;
              err.code = errorCode.Group_members_should_be_more_than_one;
              break;
            case "array.unique":
              err.message = `Members array should not contain duplicate IDs`;
              err.code = errorCode.Group_members_contain_duplicate_values;
              break;
            case "any.invalid":
              err.message = `TEST`;
              err.code = errorCode.Group_members_contain_duplicate_values;
              break;
            case "any.required":
              err.message = `Members array required`;
              err.code = errorCode.Group_members_required;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  sendMessageInGroup: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group ID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.base":
              err.message = "Group ID should be string";
              err.code = errorCode.Group_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
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
      .exist()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
              err.message = "Message body required";
              err.code = errorCode.Message_required;
              break;
            case "string.base":
              err.message = "Message body should be string";
              err.code = errorCode.Message_not_string;
              break;
            case "string.max":
              err.message = `Message body should not exceed ${err.local.limit} characters`;
              err.code = errorCode.Message_too_long;
              break;
            case "string.empty":
              err.message = "Message body should not be empty";
              err.code = errorCode.Group_message_not_empty;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  sendThreadMessage: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group ID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.base":
              err.message = "Group ID should be string";
              err.code = errorCode.Group_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    messageId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Message ID required";
              err.code = errorCode.Message_id_required;
              break;
            case "string.base":
              err.message = "Message ID should be string";
              err.code = errorCode.Message_id_not_String;
              break;
            case "string.pattern.base":
              err.message = "MessageID should contain only numeric values";
              err.code = errorCode.Message_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    message: Joi.string()
      .trim()
      .max(1000)
      .trim()
      .exist()
      .required()
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
            case "string.empty":
              err.message = "Message should not be empty";
              err.code = errorCode.Group_message_not_empty;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  editMessage: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group ID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.base":
              err.message = "Group ID should be string";
              err.code = errorCode.Group_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    messageId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Message ID required";
              err.code = errorCode.Message_id_required;
              break;
            case "string.base":
              err.message = "Message ID should be string";
              err.code = errorCode.Message_id_not_String;
              break;
            case "string.pattern.base":
              err.message = "MessageID should contain only numeric values";
              err.code = errorCode.Message_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    message: Joi.string()
      .trim()
      .max(1000)
      .trim()
      .exist()
      .required()
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
            case "string.empty":
              err.message = "Message should not be empty";
              err.code = errorCode.Group_message_not_empty;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  deleteMessage: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group ID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.base":
              err.message = "Group ID should be string";
              err.code = errorCode.Group_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    messageId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Message ID required";
              err.code = errorCode.Message_id_required;
              break;
            case "string.base":
              err.message = "Message ID should be string";
              err.code = errorCode.Message_id_not_String;
              break;
            case "string.pattern.base":
              err.message = "MessageID should contain only numeric values";
              err.code = errorCode.Message_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  editThreadMessage: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group ID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.base":
              err.message = "Group ID should be string";
              err.code = errorCode.Group_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    threadId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Thread ID required";
              err.code = errorCode.Thread_id_required;
              break;
            case "string.base":
              err.message = "Thread ID should be string";
              err.code = errorCode.Thread_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "ThreadID should contain only numeric values";
              err.code = errorCode.Thread_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    messageId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Message ID required";
              err.code = errorCode.Message_id_required;
              break;
            case "string.base":
              err.message = "Message ID should be string";
              err.code = errorCode.Message_id_not_String;
              break;
            case "string.pattern.base":
              err.message = "MessageID should contain only numeric values";
              err.code = errorCode.Message_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    message: Joi.string()
      .trim()
      .max(1000)
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
            case "string.empty":
              err.message = "Message should not be empty";
              err.code = errorCode.Group_message_not_empty;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),

  deleteThreadMessage: Joi.object({
    groupId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Group ID required";
              err.code = errorCode.Group_id_required;
              break;
            case "string.base":
              err.message = "Group ID should be string";
              err.code = errorCode.Group_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "GroupID should contain only numeric values";
              err.code = errorCode.Group_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
    messageId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Message ID required";
              err.code = errorCode.Message_id_required;
              break;
            case "string.base":
              err.message = "Message ID should be string";
              err.code = errorCode.Message_id_not_String;
              break;
            case "string.pattern.base":
              err.message = "MessageID should contain only numeric values";
              err.code = errorCode.Message_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),

    threadId: Joi.string()
      .trim()
      .pattern(/^\d+$/)
      .empty()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          switch (err.code) {
            case "any.required":
            case "string.empty":
              err.message = "Thread ID required";
              err.code = errorCode.Thread_id_required;
              break;
            case "string.base":
              err.message = "Thread ID should be string";
              err.code = errorCode.Thread_id_not_string;
              break;
            case "string.pattern.base":
              err.message = "ThreadID should contain only numeric values";
              err.code = errorCode.Thread_id_should_be_numeric;
              break;
            default:
              break;
          }
        });
        return errors;
      }),
  }),
};

async function checkGroupMembersInDB(userIds) {
  userIds = userIds.map((id) => Long.fromString(id));
  const existingUsers = await Users.find({
    _id: { $in: userIds },
  });
  if (existingUsers.length !== userIds.length) {
    return false;
  }
  return true;
}

module.exports = { groupValidator };
