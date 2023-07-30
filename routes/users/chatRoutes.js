const express = require("express");
const {
  createChat,
  userChats,
  findChat,
} = require("../../controllers/users/chatControllers");

const chatRouter = express.Router();

chatRouter.post("/", createChat);
chatRouter.get("/:userId", userChats);
chatRouter.get("/find/:firstId/:secondId", findChat);
// chatRouter.get("/", (req, res) => {
//   res.send("i love you mow sona");
// });

module.exports = chatRouter;
