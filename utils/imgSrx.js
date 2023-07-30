const { dataUri } = require("../middlewares/multerUploads");

const cloudinary = require("cloudinary").v2;

const imgSrc = async (req, res) => {
  if (req.file) {
    const file = await dataUri(req).content;
    return cloudinary.uploader
      .upload(file, { folder: "/uploads/ProfilePhoto" })
      .then((result) => {
        return result.url;
        // const image = result.url;
        // const image = result.url;
        // console.log(image);
        // // Output: "https://res.cloudinary.com/demo/image/upload/w_100,h_150,c_fill/sample.jpg"
        // return res.status(200).json({
        //   messge: "Your image has been uploded successfully to cloudinary",
        //   data: {
        //     image,
        //   },
        // });
      })
      .catch((err) =>
        res.status(400).json({
          messge: "someting went wrong while processing your request",
          data: {
            err,
          },
        })
      );
  }
};

module.exports = imgSrc;
