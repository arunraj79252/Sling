const db = require("../models");

//Connect to database
const dbConnect = async () => {
  await db.mongoose
    .connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to database!");
    })
    .catch((error) => {
      console.log("Cannot connect to database! Retrying...");
      console.error("Error connecting DB: ", error);
      logger.error("Error connecting to DB: ", error);
      dbConnect();
    });
};

dbConnect()
