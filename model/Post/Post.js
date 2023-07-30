const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
    },
    description: {
      type: String,
      // required: [true, "description is required"]
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Author is required"],
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

//Hooks middleware

postSchema.pre(/^find/, function (next) {
  //Add viewscount as virtual preperty
  postSchema.virtual("viewsCount").get(function () {
    const post = this;
    return post.views.length;
  });

  //Add likesCount as virtual preperty
  postSchema.virtual("likesCount").get(function () {
    const post = this;
    return post.likes.length;
  });

  //Add dislikesCount as virtual preperty
  postSchema.virtual("dislikesCount").get(function () {
    const post = this;
    return post.dislikes.length;
  });
  //Add likesPercentage as virtual preperty
  postSchema.virtual("likesPercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.dislikes.length;
    const percentage = (post.likes.length / total) * 100;
    return percentage ? `${percentage}%` : `0%`;
  });

  //Add disLikesPercentage as virtual preperty
  postSchema.virtual("disLikesPercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.dislikes.length;
    const percentage = (post.dislikes.length / total) * 100;
    return percentage ? `${percentage}%` : `0%`;
  });

  //if days is less then 0 return today if days if 1 return yesterday else return days ago

  postSchema.virtual("daysAgo").get(function () {
    const post = this;
    const date = new Date(post.createdAt);

    const options = {
      // weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h12",
    };

    const atMin = date.toLocaleString("en-GB", options);

    const daysAgo = Math.floor((Date.now() - date) / 86400000);

    const withMonth = date.toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return daysAgo === 0
      ? `Today at ${atMin}`
      : daysAgo === 1
      ? `Yesterday at ${atMin}`
      : daysAgo < 10
      ? `${daysAgo} days ago`
      : `${withMonth}`;
  });

  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
