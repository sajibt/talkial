const bcrypt = require("bcrypt");
const Category = require("../../model/Category/Category");
const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr");
const generateToken = require("../../utils/generateToken");
const getToken = require("../../utils/getToken");

//register
const register = async (req, res, next) => {
  const { firstName, lastName, email, password, username } = req.body;

  try {
    const userFound = await User.findOne({ email });
    const usernameFound = await User.findOne({ username });

    if (userFound) {
      return next(appErr("User Already Exist", 500));
    }

    if (usernameFound) {
      return next(appErr("username Already taken, try another", 500));
    }
    //Hash password
    const saltRounds = 11;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    //Create the new user
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hash,
    });

    res.json({
      status: "Register Success",
      data: user,
      token: generateToken(user._id),
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //Check  if email is exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(appErr("Wrong login credentials"));
    }

    //Validity the password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );
    if (!isPasswordMatched) {
      return next(appErr("Wrong login credentials"));
    }

    res.json({
      status: "Login Success",
      data: {
        firstName: userFound.firstName,
        lastName: userFound.lastName,
        username: userFound.username,
        isAdmin: userFound.isAdmin,
      },
      token: generateToken(userFound._id),
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Profile Photo Upload
const profilePhotoUpload = async (req, res, next) => {
  const { path } = req.file;
  try {
    // Find the  Correct user for upload image
    const user = await User.findById(req.userAuth);

    // check if user is found
    if (!user) {
      return next(appErr("User not found"), 403);
    }

    // check if user is bloacked
    if (user.isBlocked) {
      return next(appErr("Action not allowed, your account is blocked"), 403);
    }

    //Check if  the  user is updating their photo
    if (req.file) {
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: path,
          },
        },
        { new: true }
      );

      //Update Profile Photo
      res.json({
        status: "Success",
        data: "Profile photo Updated",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Profile Viewers Check visitor

const getViewers = async (req, res, next) => {
  try {
    const { id } = req.params;

    //Find the originial user id from params
    const user = await User.findById(id);
    console.log(user, "user");

    //Find the user who viewed the originial user
    const userWhoViewed = await User.findById(req.userAuth);

    //Check if original and who viewd are found

    if (user && userWhoViewed) {
      //Check if userWhoViewed is already in the users viewers array
      const isUserAlreadyViewed = user.viewers.find(
        (viewer) => viewer.toString() === userWhoViewed._id.toJSON()
        // (viewer) => viewer.toString() === JSON.stringify(userWhoViewed._id)
      );
      if (isUserAlreadyViewed) {
        return next(appErr("You already viewed this profile"));
      } else {
        //push the user who viewed to the originial user's viewers aray
        user.viewers.push(userWhoViewed._id);
        //save the user
        await user.save();

        res.json({
          status: "Success",
          data: "you have viewed this profile",
        });
      }
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

//all
const getAllUser = async (req, res, next) => {
  try {
    const user = await User.find({});
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Following
const followingCtrl = async (req, res, next) => {
  try {
    //Find the user to follow  -> followers {mow}
    const userToFollow = await User.findById(req.params.id);
    // console.log(userToFollow, "userToFollow");

    //Find the user who is following  {sajib}
    const userWhoFollowed = await User.findById(req.userAuth);
    // console.log(userWhoFollowed);

    //check if userToFollow and user WhoFollowed is found
    if (userToFollow && userWhoFollowed) {
      //Check if userWhoFollowed {sajib} has already in followers array
      const isUserAlreadyFollowed = userToFollow.followers.find(
        (follower) => follower.toString() === userWhoFollowed._id.toJSON()
      );
      if (isUserAlreadyFollowed) {
        return next(appErr("You already followed this user"));
      } else {
        //push userWhoFollowed into the user's followers array
        userToFollow.followers.push(userWhoFollowed._id);
        //push userToFollow to the  userWhoFollowed into the  following array
        userWhoFollowed.following.push(userToFollow._id);

        //save
        await userWhoFollowed.save();
        await userToFollow.save();

        res.json({
          status: "Success",
          // data: "You have successfully followed this user ",
          data: userToFollow,
        });
      }
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Unfollow Controllers
const unFollowCtrl = async (req, res, next) => {
  try {
    //Find the user to unfollow  -> unfollowing {mow}
    const userToUnFollowed = await User.findById(req.params.id);

    //Find the user who is unfollowing  {sajib}
    const userWhoUnFollowed = await User.findById(req.userAuth);

    //check if userToUnFollowed and user WhoUnFollowed is found
    if (userToUnFollowed && userWhoUnFollowed) {
      //Check if userWhoUnFollowed {sajib} has already in followers array
      const isUserAlreadyFollowed = userToUnFollowed.followers.find(
        (follower) => follower.toString() === userWhoUnFollowed._id.toJSON()
      );
      if (!isUserAlreadyFollowed) {
        return next(appErr("You are not following this user"));
      } else {
        //remove userWhoUnFollowed  from the user's followers {admin} array
        userToUnFollowed.followers = userToUnFollowed.followers.filter(
          (follower) => follower.toString() !== userWhoUnFollowed._id.toString()
        );

        //save
        await userToUnFollowed.save();
        //remove userToUnFollowed {admin} from the  userWhoUnFollowed  {user}  following array
        userWhoUnFollowed.following = userWhoUnFollowed.following.filter(
          (following) =>
            following.toString() !== userToUnFollowed._id.toString()
        );

        //save
        await userWhoUnFollowed.save();

        res.json({
          status: "Success",
          // data: "You have successfully Unfollowed this user ",
          data: userToUnFollowed,
        });
      }
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Block  user
const blockUserCtrl = async (req, res, next) => {
  try {
    //Find the user to be blocked
    const userToBeBlocked = await User.findById(req.params.id);

    // find the user who is blocking
    const userWhoBlocked = await User.findById(req.userAuth);

    //Check if  userToBeBlocked and userWhoBlocked are found
    if (userToBeBlocked && userWhoBlocked) {
      //Check if userToBeBlocked   already in blocked array
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeBlocked._id.toString()
      );

      if (isUserAlreadyBlocked) {
        return next(appErr("You Already Blocked this user"));
      } else {
        // push  userToBeBlocked to the useWhoBlocked's blocked array

        userWhoBlocked.blocked.push(userToBeBlocked._id);
      }

      //Save
      await userWhoBlocked.save();

      res.json({
        status: "Success",
        data: "You have successfully Blocked This user",
      });
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Unblock user
const unBlockUserCtrl = async (req, res, next) => {
  try {
    //Find the user to be Unblocked
    const userToBeUnBlocked = await User.findById(req.params.id);

    // find the user who is unblocking
    const userWhoUnBlocked = await User.findById(req.userAuth);

    //Check if  userToBeUnBlocked and userWhoUnBlocked are found
    if (userToBeUnBlocked && userWhoUnBlocked) {
      //Check if userToBeUnBlocked are  already in userWhoUnblocked  blocked array
      const isUserAlreadyUnBlocked = userWhoUnBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeUnBlocked._id.toString()
      );

      if (!isUserAlreadyUnBlocked) {
        return next(appErr("You have not Blocked this user"));
      } else {
        //Remove the userToBeUnBlocked from the  logged in user blocked list
        userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
          (blocked) => blocked.toString() !== userToBeUnBlocked._id.toString()
        );
      }

      //Save
      await userWhoUnBlocked.save();

      res.json({
        status: "Success",
        data: "You have successfully UnBlocked This user",
      });
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Admin block user
const adminBlockUser = async (req, res, next) => {
  try {
    //Find the user
    const userToBeBlocked = await User.findById(req.params.id);

    //Check if user found
    if (!userToBeBlocked) {
      return next(appErr("User not found"));
    }

    userToBeBlocked.isBlocked = true;

    await userToBeBlocked.save();
    res.json({
      status: "Success",
      data: "You have  successfully blocked this user",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Admin unblock user
const adminUnBlockUser = async (req, res, next) => {
  try {
    //Find the user to be unblocked
    const userToBeUnBlocked = await User.findById(req.params.id);

    //Check if user found
    if (!userToBeUnBlocked) {
      return next(appErr("Blocked User not found"));
    }

    userToBeUnBlocked.isBlocked = false;

    await userToBeUnBlocked.save();
    res.json({
      status: "Success",
      data: "You have  successfully Unblocked this user",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Profile
const getSingleUser = async (req, res) => {
  // const { id } = req.params;
  // instead of id get from req.params we can use req.userAuth
  const user = await User.findById(req.userAuth);

  try {
    // const token = getToken(req);
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Get user link

const getUserLink = async (req, res) => {
  const { id } = req.params;
  // instead of id get from req.params we can use req.userAuth
  const user = await User.findById(id);

  try {
    // const token = getToken(req);
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Updating the user
const updateUser = async (req, res, next) => {
  const { firstName, lastName, email, bio } = req.body;

  try {
    //check if email is not taken
    if (email) {
      const isTaken = await User.findOne({ email });
      console.log(User, "hey");
      if (isTaken) {
        return next(appErr("Email is taken"));
      }
    }

    //update the logged in  user
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        firstName,
        lastName,
        bio,
        email,
      },
      { new: true, runValidators: true }
    );

    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Updating the Password
const updatePassword = async (req, res, next) => {
  const { password } = req.body;

  try {
    if (password) {
      //Hash the password
      const saltRound = 11;
      const salt = bcrypt.genSaltSync(saltRound);
      const hash = bcrypt.hashSync(password, salt);

      //find the user and update the password
      await User.findByIdAndUpdate(
        req.userAuth,
        { password: hash },
        { new: true, runValidators: true }
      );
      res.json({
        status: "Success",
        data: "Password has been changed successfully",
      });
    } else {
      return next(appErr("Please Provide password field"));
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Delete user Account Permanent
const deleteUser = async (req, res, next) => {
  try {
    //Find the user to be deleted
    const user = await User.findById(req.userAuth);
    //find all post to be deleted
    await Post.deleteMany({ user: req.userAuth });
    //find all comment to be deleted
    await Comment.deleteMany({ user: req.userAuth });
    //find all Category  to be deleted
    await Category.deleteMany({ user: req.userAuth });
    //Finally delete the user
    await user.delete();

    return res.json({
      status: "Success",
      data: "Your account has been deleted successfully",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// const addFriend = async (req, res, next) => {
//   try {
//     if (req.userAuth !== req.params.id) {
//       const sender = await User.findById(req.userAuth);

//       const receiver = await User.findById(req.params.id);

//       //Check is sender is already is requests array & in friendslist array

//       if (
//         !receiver.requests.includes(sender._Id) &&
//         !receiver.friends.includes(sender._id)
//       ) {
//         await receiver.updateOne({
//           $push: { requests: sender._id },
//         });
//         next(res.json("Friend request has been sent"));
//       } else {
//         next(appErr("Already sent", 400));
//       }
//     } else {
//       return next(appErr("You can't send a request to yoursef", 400));
//     }
//   } catch (error) {
//     return next(appErr(error.message));
//   }
// };

module.exports = {
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
  getUserLink,
};
