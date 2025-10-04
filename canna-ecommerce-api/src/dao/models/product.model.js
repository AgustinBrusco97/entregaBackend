// src/dao/models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, index: true },
    description: { type: String, default: '' },
    code:        { type: String, required: true, unique: true, index: true }, // 👈 necesario para tu UI
    price:       { type: Number, required: true, index: true },
    category:    { type: String, index: true },
    status:      { type: Boolean, default: true },
    stock:       { type: Number, default: 0 },
    thumbnails:  [{ type: String }],
    specs:       { type: Object, default: {} }
  },
  { timestamps: true }
);

const ProductModel = mongoose.model('Product', productSchema);
module.exports = { ProductModel };
