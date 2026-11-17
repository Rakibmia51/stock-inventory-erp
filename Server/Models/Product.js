const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  price: { type: Number, required: true, min: 0 },
  minStockLevel: { type: Number, default: 5 } // এই সংখ্যার নিচে নামলে Low Stock দেখাবে
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);