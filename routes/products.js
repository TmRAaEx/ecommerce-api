const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
    console.log("test")
    try {
        res.json(await Product.find());
    } catch(error) {
        res.json({message: error});
    }
});
router.get("/add-prod", async (req, res) =>{
   await addProduct()
   res.json({test: "test"})
} )


async function addProduct() {
  const newProduct = new Product({
    name: "Test Product",
    description: "This is a test product",
    price: 99.99,
    stock: 100,
    categories: ["Electronics", "Gadgets"],
    image: "https://example.com/product-image.jpg",
  });

  try {
    const savedProduct = await newProduct.save();
    console.log("Product added:", savedProduct);
  } catch (err) {
    console.error("Error adding product:", err.message);
  }
}

module.exports = router;