const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr");

//Create post
const createPost = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    //Find the user
    const author = await User.findById(req.userAuth);

    //Check if the user is blocked
    if (author.isBlocked) {
      return next(appErr("Access denied, account blocked"));
    }

    //Create the post
    let createPost = await Post.create({
      title,
      description,
      user: author._id,
      category,
      image: req?.file?.path,
    });
    // Associate the user to a post &  push the post into the user posts field
    author.posts.push(createPost);

    //Save the user
    await author.save();
    createPost = await createPost.populate("user category title", "-password");

    res.json({
      status: "Successfully created Post",
      data: createPost,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Get all posts
const getPosts = async (req, res, next) => {
  try {
    //Find all posts
    const posts = await Post.find({})
      .populate("user", "-password")
      .populate("category", "title")
      .sort({ createdAt: -1 });

    //Check if the log in user blocked by post ownner

    const filterPosts = posts.filter((post) => {
      const blockUsers = post.user.blocked;
      //Check if login user is listed in blockeduser array
      const isBlocked = blockUsers.includes(req.userAuth);

      return isBlocked ? null : post;
    });
    res.json({
      status: "Success",
      data: filterPosts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Toggle LIkes
const toggleLikesPost = async (req, res, next) => {
  try {
    //Get the post
    const post = await Post.findById(req.params.id)
      .populate("user", "-password")
      .populate("category", "title")
      .sort({ createdAt: -1 });

    //Check if the user has already likes the post
    const isLiked = post.likes.includes(req.userAuth);

    //if user already likes then unlike it
    if (isLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.userAuth.toString()
      );
      await post.save();
    } else {
      //if user has not liked the post , like the post
      post.likes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "Success",
      data: post,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Toggle dislikes
const toggleDisLikesPost = async (req, res, next) => {
  try {
    //Get the post
    const post = await Post.findById(req.params.id);

    //Check if the user has already Dislikes the post
    const isDisLiked = post.dislikes.includes(req.userAuth);

    //if user already dislike then like it
    if (isDisLiked) {
      post.dislikes = post.dislikes.filter(
        (dislike) => dislike.toString() !== req.userAuth.toString()
      );
      await post.save();
    } else {
      //if user has not Dislikes the post , Dislike the post
      post.dislikes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "Success",
      data: post,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Total Posts views & post details single
const postDetails = async (req, res, next) => {
  try {
    //Find the post
    const post = await Post.findById(req.params.id);

    // number of views
    //Check if logged user viewed this post
    const isViewed = post.views.includes(req.userAuth);
    if (isViewed) {
      res.json({
        status: "Success",
        data: post,
      });
    } else {
      //fi not found then push the user into views array
      post.views.push(req.userAuth);
      //Save the post
      await post.save();

      res.json({
        status: "Success",
        data: post,
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

//Update post
const updatePosts = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    //Find the post we wants to updated
    const post = await Post.findById(req.params.id);

    //Check if the  post belongs to user
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appErr("You are not allowed to update this post", 403));
    }
    //update the post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        image: req?.file?.path,
      },
      {
        new: true,
      }
    );

    res.json({
      status: "Success",
      data: updatedPost,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Delete post
const deletePost = async (req, res, next) => {
  try {
    //Find the post we wanted deleted
    const post = await Post.findById(req.params.id);

    //Check if the user have permission to delete the post
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this post", 403));
    }
    //delete the post
    await Post.findByIdAndDelete(req.params.id);

    res.json({
      status: "Success",
      data: "Post Deleted Successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  createPost,
  getPosts,
  updatePosts,
  deletePost,
  toggleLikesPost,
  toggleDisLikesPost,
  postDetails,
};
