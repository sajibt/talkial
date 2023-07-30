const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr");

const createComment = async (req, res, next) => {
  const { description } = req.body;

  try {
    //Find the post
    const post = await Post.findById(req.params.id);

    //Create the comment
    const comment = await Comment.create({
      post: post._id,
      description,
      user: req.userAuth,
    });

    //push comments to the posts
    post.comments.push(comment._id);

    //find the user
    const user = await User.findById(req.userAuth);
    //push to the users
    user.comments.push(comment._id);

    //Save
    await post.save();
    await user.save();
    res.json({
      status: "Success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

const singleComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    res.json({
      status: "Success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({});
    res.json({
      status: "Success",
      data: comments,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

const updateComments = async (req, res, next) => {
  const { description } = req.body;
  try {
    //Find the comment
    const comment = await Comment.findById(req.params.id);

    //Check if the person is the owner of this comment
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(
        appErr("You don't have permission to update this comment", 403)
      );
    }

    const updateComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { description },
      { new: true, runValidators: true }
    );

    res.json({
      status: "Success",
      data: updateComment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const deleteComments = async (req, res, next) => {
  try {
    //Find the comment
    const comment = await Comment.findById(req.params.id);

    //Check if the person is the owner of  delete this comment
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(
        appErr("You don't have permission to delete this comment", 403)
      );
    }

    //Delete The Comment
    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      status: "Success",
      data: "Comment deleted Successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  createComment,
  singleComment,
  getAllComments,
  updateComments,
  deleteComments,
};
