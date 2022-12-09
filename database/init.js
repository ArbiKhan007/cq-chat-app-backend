const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

module.exports = function () {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(function () {
      console.log("database connection established");
    })
    .catch(function () {
      console.log("db connection error");
    });
};
