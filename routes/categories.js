const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/:category", async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const category = req.params.category;
  try {
    if (category) {
      const products = await Product.find({
        categories: { $regex: category, $options: "i" },
        hot: { $gt: 80 },
      })
        .skip(skip)
        .limit(limit);
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
