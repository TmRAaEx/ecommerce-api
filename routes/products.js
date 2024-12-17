const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; //determines how manmy items to show
  const page = parseInt(req.query.page) || 1; // sets what "page" to show
  const skip = (page - 1) * limit; //determines what page to show
  try {
    res.json(
      await Product.find() //fetches all documents
        .sort({ hot: -1 }) // sorts products on main page by "hot"
        .skip(skip) //skips unwanted documents
        .limit(limit) //returns documents based on the limit
    );
  } catch (error) {
    res.json({ message: error });
  }
});

// Fetch by ID
router.get("/:id", async (req, res) => {
  const product_id = req.params.id;

  try {
    res.json(await Product.findById(product_id));
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
