const Chat = require("../../model/User/Chat");
const appErr = require("../../utils/appErr");

//Create Chat
const createChat = async (req, res, next) => {
  const newChat = new Chat({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const result = await newChat.save();
    res.status(200).json({
      status: "Success",
      data: result,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//User Chats
const userChats = async (req, res, next) => {
  try {
    const chat = await Chat.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json({
      status: "Success",
      data: chat,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Find chat between two person
const findChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    }).populate("user");
    res.status(200).json({
      status: "success",
      data: chat,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = { createChat, userChats, findChat };
