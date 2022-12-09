const mongoose = require("mongoose");

const { Schema } = mongoose;

const GroupSchema = new Schema({
  name: { type: String, unique: true },
  members: {
    type: Array,
    ref: "User",
    required: true,
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
});

const Group = mongoose.model("group", GroupSchema);

module.exports = Group;
