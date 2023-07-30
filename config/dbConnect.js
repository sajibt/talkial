const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("DB Conencted");
  } catch (error) {
    console.log(error.message);
  }
};

dbConnect();
// module.exports = dbConnect;
