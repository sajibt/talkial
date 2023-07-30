const express = require("express");
const {
  createCategories,
  getSingleCategory,
  updateCategories,
  deleteCategories,
  allCategories,
} = require("../../controllers/categories/categoryControllers");
const isLogin = require("../../middlewares/isLogin");

const categoryRouter = express.Router();

//POST /api/v1/categories
categoryRouter.post("/", isLogin, createCategories);

//GET /api/v1/categories
categoryRouter.get("/", isLogin, allCategories);

//GET /api/v1/categories/:id
categoryRouter.get("/:id", isLogin, getSingleCategory);

//PUT /api/v1/categories/:id
categoryRouter.put("/:id", isLogin, updateCategories);

//DELETE /api/v1/categories/:id
categoryRouter.delete("/:id", isLogin, deleteCategories);

module.exports = categoryRouter;
