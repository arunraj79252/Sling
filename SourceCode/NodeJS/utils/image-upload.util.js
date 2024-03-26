const multerS3 = require("multer-s3");
const errorCode = require("../constants/error-codes");
const { S3 } = require("@aws-sdk/client-s3");
const multer = require("@koa/multer");
const MAX_FILE_SIZE = 1024 * 1024 * 5; //5MB
const bucket = process.env.AWS_BUCKET;
require("dotenv").config();
const { logger } = require("./logger.utils");
const s3 = new S3({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  endpoint: process.env.AWS_ENDPOINT,
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `image/temp/${Date.now()}${file.originalname}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      return cb(
        {
          message: "Only .png, .jpg and .jpeg format allowed",
          errorCode: errorCode.Invalid_image_type,
        },
        false
      );
    }
  },
});

const uploadImage = async (ctx) => {
  return new Promise((resolve, reject) => {
    const uploadFile = upload.single("profileImage");
    uploadFile(ctx, () => {
      if (!ctx.request.file) {
        const error = new Error("File Required");
        error.errorCode = errorCode.No_file_uploaded;
        reject(error);
        return;
      }
      resolve();
    }).catch((error) => {
      if (error.code === "LIMIT_FILE_SIZE") error.errorCode = errorCode.Image_too_large;
      else if (error.code === "LIMIT_UNEXPECTED_FILE") error.errorCode = errorCode.Unexpected_field;
      reject(error);
    });
  });
};

async function deleteFile(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const imageKey = fileName.split("/sling/")[1];
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: imageKey,
      };

      await s3.headObject(params);
      await s3.deleteObject(params);
      resolve({ message: "File deleted successfully" });
    } catch (error) {
      if (error.name == "NotFound") {
        logger.info("File not found in s3!");
        resolve({ message: "File not found in s3!" });
      }
      const err = new Error(`Error fetching/deleting file: ${fileName}. Error:${error}`);
      err.errorCode = errorCode.Error_while_fetching_file;
      reject(err);
    }
  });
}

const checkImageExist = async (image) => {
  return s3
    .headObject({
      Bucket: bucket,
      Key: "/image/temp/" + image,
    })
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
};

const moveImageFromTemp = async (image, id, imageType = "user") => {
  let targetKey = `/profileImages/${id}/${image}`;
  if (imageType === "group") {
    targetKey = `/groupImages/${id}/${image}`;
  }
  return new Promise(async (resolve, reject) => {
    const imageExist = await checkImageExist(image);
    if (!imageExist) {
      reject({
        message: "Image does not exist in server",
        errorCode: errorCode.Profile_image_not_found_in_server,
      });
    } else {
      id = id.toString();
      await s3
        .copyObject({
          Bucket: bucket,
          CopySource: `${bucket}/image/temp/${image}`,
          Key: targetKey,
          ACL: "public-read",
        })
        .then(() => {
          s3.deleteObject({
            Bucket: bucket,
            Key: `/image/temp/${image}`,
          });
          resolve(true);
        })
        .catch(() => {
          reject({
            message: "Error while moving image in server.",
            errorCode: errorCode.Error_while_uploading_image,
          });
        });
    }
  });
};

const deleteImageFromTemp = async (image) => {
  return new Promise(async (resolve, reject) => {
    const imageExist = await checkImageExist(image);
    if (!imageExist) {
      reject({
        message: "Image does not exist in server",
        errorCode: errorCode.Profile_image_not_found_in_server,
      });
    } else {
      s3.deleteObject({
        Bucket: bucket,
        Key: "image/temp/" + image,
      })
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          reject({
            message: "Image does not exist in server",
            errorCode: errorCode.Profile_image_not_found_in_server,
          });
        });
    }
  });
};

module.exports = {
  uploadImage,
  upload,
  deleteFile,
  moveImageFromTemp,
  deleteImageFromTemp,
};
