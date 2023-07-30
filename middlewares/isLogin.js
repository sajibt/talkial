const appErr = require("../utils/appErr");
const getToken = require("../utils/getToken");
const verifyToken = require("../utils/verifyToken");

const isLogin = (req, res, next) => {
  //Get token from the header
  const token = getToken(req);
  //Verify the token
  const decodedUser = verifyToken(token);
  //Save the user info into req Objecct
  req.userAuth = decodedUser.id;

  if (!decodedUser) {
    return next(appErr(" Invalid/Expired Token , Please login again", 500));
  } else {
    next();
  }
};

module.exports = isLogin;
