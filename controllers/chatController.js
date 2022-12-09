const Chat = require("../database/models/Chat");
const Validator = require("validatorjs");

const chatRules = {
  chatText: "required",
  senderId: "required",
  groupId: "required",
};

async function saveUserChat(req, res, next) {
  try {
    let chatObj = {
      senderId: req.user._id,
      senderName: req.user.username,
      groupId: req.body.groupId,
      chatText: req.body.message,
      dateTime: new Date().toISOString(),
    };

    let validation = new Validator(chatObj, chatRules);

    if (validation.passes()) {
      //*imp
      const chat = await Chat.create({ ...chatObj });
      req.chat = chat;
      console.log(chat);
    } else {
      return res.status(400).json({ message: "Whoops! Chat not valid" });
    }
  } catch (error) {
    console.log(error);
  }
}

async function getGroupChats(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;

    const groupChats = await Chat.find({
      groupId: req.body.groupId,
    })
      .sort({ dateTime: "desc" })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Chat.countDocuments();

    groupChats.reverse();

    res.status(200).json({
      chats: groupChats,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { saveUserChat, getGroupChats };
