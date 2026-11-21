// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
//   category: { type: String, required: true, trim: true },

//   // স্টক লেজার কলামের জন্য ট্র্যাকিং ফিল্ডসমূহ
//   openingStock: { type: Number, default: 0, min: 0 },
//   purchasedQty: { type: Number, default: 0, min: 0 },
//   soldQty: { type: Number, default: 0, min: 0 },
//   returnedQty: { type: Number, default: 0 },

//   // বর্তমান স্টক (Current Stock)
//   quantity: { type: Number, required: true, default: 0, min: 0 },

//   price: { type: Number, required: true, min: 0 },
//   minStockLevel: { type: Number, default: 5 } // এই সংখ্যার নিচে নামলে Low Stock দেখাবে
// }, { timestamps: true });

// module.exports = mongoose.model('Product', productSchema);



const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true, trim: true },

  // প্রাইসিং ফিল্ডসমূহ (Profit & Loss হিসাবের জন্য)
  buyPrice: { type: Number, required: true, default: 0, min: 0 },
  sellPrice: { type: Number, required: true, default: 0, min: 0 },

  // স্টক লেজার কলামের জন্য ট্র্যাকিং ফিল্ডসমূহ
  openingStock: { type: Number, default: 0, min: 0 },
  purchasedQty: { type: Number, default: 0, min: 0 },
  soldQty: { type: Number, default: 0, min: 0 },
  returnedQty: { type: Number, default: 0 },

  // বর্তমান স্টক (Current Stock)
  quantity: { type: Number, required: true, default: 0, min: 0 },

  minStockLevel: { type: Number, default: 5 } // এই সংখ্যার নিচে নামলে Low Stock দেখাবে
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// পুরনো কোনো জায়গায় product.price ব্যবহার করা হলে sellPrice রিটার্ন করবে
productSchema.virtual('price').get(function () {
  return this.sellPrice;
});

module.exports = mongoose.model('Product', productSchema);