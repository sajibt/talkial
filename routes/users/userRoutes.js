const express = require("express");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const {
  register,
  login,
  getSingleUser,
  deleteUser,
  updateUser,
  getAllUser,
  profilePhotoUpload,
  getViewers,
  followingCtrl,
  unFollowCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
  adminBlockUser,
  adminUnBlockUser,
  updatePassword,
  addFriend,
  getUserLink,
} = require("../../controllers/users/userControllers");
const isLogin = require("../../middlewares/isLogin");
const isAdmin = require("../../middlewares/IsAdmin");

const userRouter = express.Router();

const upload = multer({ storage });

//POST /api/v1/users/register
userRouter.post("/register", register);

//POST /api/v1/users/login
userRouter.post("/login", login);

//GET /api/v1/users
userRouter.get("/", isLogin, getAllUser);

// GET /api/v1/users/profile/:id
userRouter.get("/profile/", isLogin, getSingleUser);

// GET /api/v1/users/profile/:id
userRouter.get("/profile/:id", isLogin, getUserLink);

//PUT /api/v1/users/
userRouter.put("/", isLogin, updateUser);

//PUT /api/v1/users/update-password
userRouter.put("/update-password", isLogin, updatePassword);

//DELETE /api/v1/users/delete-account
userRouter.delete("/delete-account", isLogin, deleteUser);

//POST /api/v1/users/photoupload/:id
userRouter.post(
  "/photoupload",
  isLogin,
  upload.single("image"),
  profilePhotoUpload
);

//GET /api/v1/users/viewers/:id
userRouter.get("/viewers/:id", isLogin, getViewers);

//GET /api/v1/users/follow/:id
userRouter.get("/follow/:id", isLogin, followingCtrl);

//GET /api/v1/users/unfollow/:id
userRouter.get("/unfollow/:id", isLogin, unFollowCtrl);

//GET /api/v1/users/add-friend
// userRouter.put("/add-friend/:id", isLogin, addFriend);

//GET /api/v1/users/block/:id
userRouter.get("/block/:id", isLogin, blockUserCtrl);

//GET /api/v1/users/unblock/:id
userRouter.get("/unblock/:id", isLogin, unBlockUserCtrl);

//PUT /api/v1/users/blockbyadmin/:id
userRouter.put("/blockbyadmin/:id", isLogin, isAdmin, adminBlockUser);

//PUT /api/v1/users/unblockbyadmin/:id
userRouter.put("/unblockbyadmin/:id", isLogin, isAdmin, adminUnBlockUser);

// userRouter.get("/", getAllUser);
module.exports = userRouter;
