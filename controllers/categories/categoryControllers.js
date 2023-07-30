const { findByIdAndDelete } = require("../../model/Category/Category");
const Category = require("../../model/Category/Category");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr");

//Create categories
const createCategories = async (req, res, next) => {
  const { title } = req.body;

  try {
    const category = await Category.create({
      title,
      user: req.userAuth,
    });

    res.json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Get All Categories
const allCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.json({
      status: "Success",
      data: categories,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Get Single Category
const getSingleCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    res.json({
      status: "single category",
      data: category,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Update Category
const updateCategories = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );
    res.json({
      status: "Updated",
      data: category,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//Delete Categories
const deleteCategories = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      status: "Deleted",
      data: "Deleted Successfully",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

module.exports = {
  createCategories,
  getSingleCategory,
  updateCategories,
  deleteCategories,
  allCategories,
};
