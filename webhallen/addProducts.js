const Product = require("../models/Product");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.DB_URL)
  //gör så den funkar med nya sättet
  .then((res) => {
    console.log("Database Connected");
  })
  .catch((error) => {
    console.error(error);
  });
const cat_list = [
  //webbhallen categories
  "https://www.webhallen.com/api/category/tiles?id=10&entityId=1&entityType=1&level=3&sectionId=1", //spel
  "https://www.webhallen.com/api/category/tiles?id=12&entityId=13&entityType=1&level=2&sectionId=13", //gaming
  "https://www.webhallen.com/api/category/tiles?id=9&entityId=11&entityType=1&level=3&sectionId=11", //nätverk och smart hem
  "https://www.webhallen.com/api/category/tiles?id=7&entityId=8&entityType=1&level=2&sectionId=8", //dator komponenter
  "https://www.webhallen.com/api/category/tiles?id=2&entityId=5&entityType=1&level=3&sectionId=5", //tv ljud och bild
  "https://www.webhallen.com/api/category/tiles?id=11&entityId=14&entityType=1&level=3&sectionId=14", //Apple
  "https://www.webhallen.com/api/category/tiles?id=8&entityId=9&entityType=1&level=3&sectionId=9", //Mobil
  "https://www.webhallen.com/api/category/tiles?id=4&entityId=6&entityType=1&level=2&sectionId=6", //hem och hälsa
  "https://www.webhallen.com/api/category/tiles?id=6&entityId=7&entityType=1&level=3&sectionId=7", //leksaker & hobby
];

async function get(url = "") {
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  if (response.status >= 400) {
    console.log("Bad response from server " + url + " " + response.status);
    return get(url);
  } else {
    return await response.json();
  }
}

async function getProducts(params) {
  for (let category in cat_list) {
    const categoryResult = await get(cat_list[category]); // Fetch category data
    for (const item of categoryResult) {
      // Fetch the subcategory's products using its category ID
      const subcategoryResult = await get(
        `https://www.webhallen.com/api/productdiscovery/category/${item.category.id}`
      );

      // Iterate over the products in this subcategory
      for (const product of subcategoryResult.products) {
        let mappedProduct = mapToProductSchema(product); // Map product data to your schema
        await saveProductIfNotExist(mappedProduct); // Save if not exists
      }
    }
  }
}
getProducts();

function mapToProductSchema(rawData) {
  // combine category path
  const category = rawData.mainCategoryPath && rawData.mainCategoryPath[1];

  return {
    webhallen_id: String(rawData.id),
    name: rawData.mainTitle,
    description: rawData.subTitle || "No description available", // Fallback to default if missing
    price: parseFloat(rawData.price?.price), // Convert price to float
    stock: rawData.stock?.web || 0, // Default to 0 if stock info is missing
    categories: category
      ? `${category.id}-${category.name.replace(/\s+/g, "-")}` // Format category as "id-name"
      : "",
    image:
      rawData.splashes && rawData.splashes.length > 0
        ? rawData.splashes[0].imageSource
        : null, // Safe access
  };
}

// Function to save a product only if it doesn't already exist
async function saveProductIfNotExist(productData) {
  try {
    // Check if the product with the given webhallen_id already exists in the database
    const existingProduct = await Product.exists({
      webhallen_id: productData.webhallen_id,
    });
    console.log(existingProduct);

    if (existingProduct) {
      console.log(
        `Product with webhallen_id ${productData.webhallen_id} already exists.`
      );
      return; // Exit if the product exists
    }

    // If product doesn't exist, create a new product
    const newProduct = new Product(productData);
    await newProduct.save();
    console.log(`Product ${productData.name} saved to the database.`);
  } catch (error) {
    console.error("Error saving product:", error);
  }
}
