const mongoose = require("mongoose");
const { Schema } = mongoose;
const ProductSchema = Schema({
  webhallen_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: false,
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  categories: {
    type: String,
    required: false,
  },
  images: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  thumbNail: { type: String, required: true },
});

module.exports = mongoose.model("Products", ProductSchema);
