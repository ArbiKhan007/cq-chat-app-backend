const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: "string",
    required: true,
    unique: true,
  },
  email: {
    type: "string",
    unique: true,
    required: [true, "email is required field"],
  },
  password: {
    type: "string",
    required: [true, "Password is required"],
    minlength: [8, "Password is short"],
  },
  phone_number: {
    type: "string",
    required: [true, "Phone Number is required"],
    minLength: [10, "Phone number is invalid"],
    maxLength: [10, "Phone number is invalid"],
  },
  avatar: "string",
  groups: {
    type: Schema.Types.Array,
    ref: "Groups",
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;
