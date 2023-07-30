const Message = require("../../model/User/Message");
const appErr = require("../../utils/appErr");

//add Message
const addMessage = async (req, res, next) => {
  const { chatId, senderId, text } = req.body;
  const message = new Message({
    chatId,
    senderId,
    text,
  });
  try {
    const result = await message.save();
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Get messages
const getMessages = async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const result = await Message.find({ chatId });
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = { addMessage, getMessages };
