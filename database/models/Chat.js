const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChatSchema = new Schema({
  chatText: String,
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  senderName: {
    type: String,
    required: true,
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  dateTime: Date,
});

const Chat = mongoose.model("chat", ChatSchema);

module.exports = Chat;
