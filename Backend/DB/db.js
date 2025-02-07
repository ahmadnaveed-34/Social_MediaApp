const mongoose = require("mongoose");
const URI = process.env.MONGODBURI;
const connectToDb = async () => {
  try {
    await mongoose
      .connect(URI)
      .then(console.log("Connected to MongoDb Successfully"))
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectToDb;
