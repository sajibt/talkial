const express = require("express");
const {
  createComment,
  singleComment,
  getAllComments,
  updateComments,
  deleteComments,
} = require("../../controllers/comments/commentControllers");
const isLogin = require("../../middlewares/isLogin");

const commentRouter = express.Router();

//POST api/v1/comments/:id
commentRouter.post("/:id", isLogin, createComment);

//GET api/v1/comments/:id
commentRouter.get("/:id", isLogin, singleComment);

//GET api/v1/comments
commentRouter.get("/", isLogin, getAllComments);

//PUT api/v1/comments/:id
commentRouter.put("/:id", isLogin, updateComments);

//DELETE api/v1/comments/:id
commentRouter.delete("/:id", isLogin, deleteComments);

module.exports = commentRouter;
