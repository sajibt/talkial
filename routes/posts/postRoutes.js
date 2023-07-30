const express = require("express");
const multer = require("multer");
const {
  getPosts,
  updatePosts,
  deletePost,
  createPost,
  toggleLikesPost,
  toggleDisLikesPost,
  postDetails,
} = require("../../controllers/posts/postControllers");
const isLogin = require("../../middlewares/isLogin");

const storage = require("../../config/upCloud");
const postRouter = express.Router();

//multer file upload

const upload = multer({ storage });

//POST /Api/v1/posts
postRouter.post("/", isLogin, upload.single("image"), createPost);

//GET /Api/v1/posts
postRouter.get("/", isLogin, getPosts);

//GET /Api/v1/posts
postRouter.get("/", isLogin, getPosts);

//GET /Api/v1/posts/:id
postRouter.get("/:id", isLogin, postDetails);

//GET /Api/v1/posts/likes/:id
postRouter.get("/likes/:id", isLogin, toggleLikesPost);

//GET /Api/v1/posts/dislikes/:id
postRouter.get("/dislikes/:id", isLogin, toggleDisLikesPost);

//PUT /Api/v1/posts/:id
postRouter.put("/:id", isLogin, upload.single("image"), updatePosts);

//DELETE /Api/v1/posts/:id
postRouter.delete("/:id", isLogin, deletePost);

// postRouter.post("/posts");

module.exports = postRouter;
