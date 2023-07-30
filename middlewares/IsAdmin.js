const User = require("../model/User/User");
const appErr = require("../utils/appErr");
const getToken = require("../utils/getToken");
const verifyToken = require("../utils/verifyToken");

const isAdmin = async (req, res, next) => {
  //Get token from the header
  const token = getToken(req);
  //Verify the token
  const decodedUser = verifyToken(token);
  //Save the user info into req Objecct
  req.userAuth = decodedUser.id;

  //Find the user in Database
  const user = await User.findById(decodedUser.id);

  if (user.isAdmin) {
    return next();
  } else {
    return next(appErr("Access Denied!", 403));
  }
};

module.exports = isAdmin;
