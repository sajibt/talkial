const mongoose = require("mongoose");
const Post = require("../Post/Post");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
    },

    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },

    bio: {
      type: String,
    },
    username: {
      type: String,
      unique: [true, "Username Must be unique"],
      required: [true, "Username is required"],
    },
    profilePhoto: {
      type: String,
      //   required: [true, "Image is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    roll: {
      type: String,
      enum: ["Admin", "User", "Guest"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // friends: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    // requests: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // plan: {
    //   {
    //     type: String,
    //     enum: ["Free", "Premium", "Pro"],
    //     default: "Free",
    //   },
    // },

    reward: {
      type: String,
      enum: ["General", "Honest", "Hunter"],
      default: "General",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

//Hooks for finding the last date when user  created last post
//pre-before record is saved find/findOne
userSchema.pre("findOne", async function (next) {
  //populated posts from  specific user
  //   this.populate("posts");
  this.populate({ path: "posts" });

  //get the user id
  const userId = this._conditions._id;

  //Find the post created by this user with this we can find the posts without populating
  const posts = await Post.find({ user: userId });

  //get the last post created by the user
  const lastPost = posts[posts.length - 1];

  //get the last post date
  const lastPostDate = new Date(lastPost?.createdAt);

  // convert it to string
  const lastPostDateStr = lastPostDate.toDateString();
  //   console.log(lastPostDate); // Sun Jan 01 2023

  //Add virtuals  to the userSchema
  userSchema.virtual("lastPostDate").get(function () {
    return lastPostDateStr;
  });

  /*------------------- Check if  user is inactive for 30 days -------------*/

  //Get the current date

  const currentDate = new Date();
  //   get the differences between the last post date and the current  date
  const diff = currentDate - lastPostDate;
  //get the differences in days and return that in days
  const diffDays = diff / (1000 * 3600 * 24);

  if (diffDays > 30) {
    // Add viruals property irregular  to the userSchema if a user is inactive for 30 days
    userSchema.virtual("irregular").get(function () {
      return true;
    });

    //Find the user by id and update
    await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
  } else {
    userSchema.virtual("irregular").get(function () {
      return false;
    });

    await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
  }

  /*----------------Last Active Date in Days --------------------*/

  const daysAgo = Math.floor(diffDays);

  userSchema.virtual("lastActive").get(function () {
    //Check if daysAgo is less than or = 0
    if (daysAgo <= 0) {
      return "Today";
    }
    //Check if daysAgo is
    if (daysAgo === 1) {
      return "Yesterday";
    }
    // if daysAgo is  greater than 1
    if (daysAgo > 1) {
      return `${daysAgo} Days ago`;
    }
  });

  /*--------------- Update reward based on number of posts -------------------- */
  //Find the number of posts
  const totalPosts = posts.length;

  //Check if the number of posts is more than 10
  if (totalPosts < 10) {
    await User.findByIdAndUpdate(userId, { reward: "General" }, { new: true });
  }
  //Check if the number of posts is less than 10
  if (totalPosts > 10) {
    await User.findByIdAndUpdate(userId, { reward: "Honest" }, { new: true });
  }

  //Check if the number of posts is more than 20
  if (totalPosts > 20) {
    await User.findByIdAndUpdate(userId, { reward: "Hunter" }, { new: true });
  }
  next();
});

//Get Fullname Virtual Property . this proepry will not stored in db but fetch/query we can use it
userSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

//initials user letter
userSchema.virtual("initials").get(function () {
  return `${this.firstName[0]}.${this.lastName[0]}`;
});

//get post count
userSchema.virtual("postCounts").get(function () {
  return this.posts.length;
});

//get following count
userSchema.virtual("followingCounts").get(function () {
  return this.following.length;
});

//get followers count
userSchema.virtual("followersCounts").get(function () {
  return this.followers.length;
});

//get viewers count
userSchema.virtual("viewersCount").get(function () {
  return this.viewers.length;
});

//get blocked count
userSchema.virtual("blockedCount").get(function () {
  return this.blocked.length;
});
//get topUser surname
userSchema.virtual("surname").get(function () {
  return this.topUser;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
