const Product = require("../models/Product");
const mongoose = require("mongoose");
require("dotenv").config();
const fs = require("fs").promises;

mongoose
  .connect(
    process.env.DB_URL
  ) //only gets ran localy
  //gör så den funkar med nya sättet
  .then((res) => {
    console.log("Database Connected");
  })
  .catch((error) => {
    console.error(error);
  });

// Function to read and parse the JSON file
async function getJSONData() {
  try {
    const data = await fs.readFile("./allCategories.json", "utf8"); //fil som jag(alex) och en klass kompis skapade för några år sen, den innehåller alla webhallens categorier och deras relation till andra kategorier
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading or parsing JSON file:", err);
    throw err;
  }
}

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
// Delay function too stop api rate limiter
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Function to fetch products for a given ID and category name
async function getProducts(idFromJSON, categoryName) {
  try {
    const baseUrl = `https://www.webhallen.com/api/productdiscovery/category/${idFromJSON}?page=`;
    let currentPage = 1;
    let allProducts = [];

    // Loop through pages until no more products are returned
    while (true) {
       const url = `${baseUrl}${currentPage}&touchpoint=DESKTOP&totalProductCountSet=false`;

      const { products } = await get(url); // Fetch products from API

    
      // If no products are returned, break out of the loop
      if (products.length === 0) {
        console.log(`No products found on page ${currentPage}. Stopping.`);
        break;
      }

      // Add the fetched products to the allProducts array
      allProducts = allProducts.concat(products);

      // Increment to the next page
      delay(3000) //delay to stop api rate limiter
      currentPage++;

    }

    // After fetching all pages, process the products
    for (const product of allProducts) {
      const mappedData = mapToProductSchema(
        product,
        categoryName.split("/")[0] // Only want the main category
      );

      saveProductIfNotExist(mappedData);
    }

    console.log(
      `Fetched a total of ${allProducts.length} products for ${categoryName}`
    );
  } catch (err) {
    console.error(
      `Error fetching products for ${categoryName} (ID: ${idFromJSON}):`,
      err
    );
  }
}


// Main function to tie everything together
async function main() {
  try {
    const jsonData = await getJSONData(); // Read JSON data
    
    // Loop through keys (IDs) and values (category names) in the JSON file
    for (const [id, categoryName] of Object.entries(jsonData)) {
      console.log(`Fetching products for category${categoryName}`);
      
      await getProducts(id, categoryName); // Fetch products
    }
  } catch (err) {
    console.error("Error in main function:", err);
  } finally {
    
    console.log("Finished processing all categories. Exiting program...");
    process.exit(0); // Exit the program after all work is finished
  }
}

// Calling main function
main();


function mapToProductSchema(rawData, mainCategory) {
  return {
    webhallen_id: String(rawData.id),
    name: rawData.name,
    rating:rawData.averageRating?.rating || "0",
    description: rawData.subTitle || "No description available", // Fallback to default if missing
    price: parseFloat(rawData.price?.price), // Convert price to float
    stock: rawData.stock?.web || 0, // Default to 0 if stock info is missing
    categories: mainCategory,
    image: `https://cdn.webhallen.com/images/product/${rawData.id}`,
  };
}

// Function to save a product only if it doesn't already exist
async function saveProductIfNotExist(productData) {
  try {
    // Check if the product with the given webhallen_id already exists in the database
    const existingProduct = await Product.exists({
      webhallen_id: productData.webhallen_id,
    });

    if (existingProduct) {
      return; // Exit if the product exists
    }

    // If product doesn't exist, create a new product
    const newProduct = new Product(productData);
    await newProduct.save();
    // console.log(`Product ${productData.name} saved to the database.`);
  } catch (error) {
    console.error("Error saving product:", error);
  }
}
