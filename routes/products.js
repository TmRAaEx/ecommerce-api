const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/", async (req, res) => {
  console.log("test");
  try {
    res.json(await Product.find());
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
