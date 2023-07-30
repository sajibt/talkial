const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  //payload ,skey and expiry date
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "28d" });
};

module.exports = generateToken;
