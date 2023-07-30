const express = require("express");
const categoryRouter = require("./routes/categories/categoryRoutes");
const commentRouter = require("./routes/comments/commentRoutes");
const postRouter = require("./routes/posts/postRoutes");
const userRouter = require("./routes/users/userRoutes");
const chatRouter = require("./routes/users/chatRoutes");
require("dotenv").config();
require("./config/dbConnect");
const cors = require("cors");
const globalErrHandler = require("./middlewares/globalErrHandler");
const isAdmin = require("./middlewares/IsAdmin");
const messageRouter = require("./routes/users/messageRoutes");

const app = express();
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(isAdmin);

// app.use("*", cloudinaryConfig);
//middleware
// const userAuth = {
//   isLogin: true,
//   isAdmin: false,
// };

// app.use((req, res, next) => {
//   if (userAuth.isLogin) {
//     next();
//   } else {
//     res.json({ msg: "invalid login credentials" });
//   }
// });

//Base url for user routes
app.use("/api/v1/users/", userRouter);
//Base url for post routes
app.use("/api/v1/posts/", postRouter);
//Base url for comment routes
app.use("/api/v1/comments/", commentRouter);
//Base url for categories routes
app.use("/api/v1/categories/", categoryRouter);
//Base url for chat Routes
app.use("/api/v1/users/chat", chatRouter);
//Base url for message Routes
app.use("/api/v1/users/message", messageRouter);

//Error handlers middleware
app.use(globalErrHandler);
//404 Error
app.use("*", (req, res) => {
  res.status(404).json({
    mesage: `${req.originalUrl} - Route Not Found`,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, console.log(`server is up and running ${PORT}`));
