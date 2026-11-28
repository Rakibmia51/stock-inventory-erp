
// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
//   category: { type: String, required: true, trim: true },

//   // প্রাইসিং ফিল্ডসমূহ (Profit & Loss হিসাবের জন্য)
//   buyPrice: { type: Number, required: true, default: 0, min: 0 },
//   sellPrice: { type: Number, required: true, default: 0, min: 0 },

//   // স্টক লেজার কলামের জন্য ট্র্যাকিং ফিল্ডসমূহ
//   openingStock: { type: Number, default: 0, min: 0 },
//   purchasedQty: { type: Number, default: 0, min: 0 },
//   soldQty: { type: Number, default: 0, min: 0 },
//   returnedQty: { type: Number, default: 0 },

//   // বর্তমান স্টক (Current Stock)
//   quantity: { type: Number, required: true, default: 0, min: 0 },

//   minStockLevel: { type: Number, default: 5 } // এই সংখ্যার নিচে নামলে Low Stock দেখাবে
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // পুরনো কোনো জায়গায় product.price ব্যবহার করা হলে sellPrice রিটার্ন করবে
// productSchema.virtual('price').get(function () {
//   return this.sellPrice;
// });

// module.exports = mongoose.model('Product', productSchema);



const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true, trim: true },

  // প্যাক সাইজ এবং প্যাক কোয়ান্টিটি ফিল্ডসমূহ
  packUnit: {
    type: String,
    enum: [
      // Count & General
      'unit', 'pcs', 'pair', 'dozen', 'set',
      // Packaging & Bulk
      'pack', 'box', 'carton', 'bag', 'sack', 'bundle', 'roll', 'packet', 'pouch', 'jar', 'can', 'tin',
      // Weight
      'kg', 'gm', 'mg', 'ton', 'quintal', 'lb',
      // Liquid & Volume
      'liter', 'ml', 'bottle', 'gallon', 'drum',
      // Pharma & Medical
      'strip', 'tablet', 'capsule', 'vial', 'ampoule', 'syrup', 'tube', 'sachet', 'drop',
      // Length & Area
      'meter', 'cm', 'feet', 'inch', 'yard', 'sqft',
      // Custom Fallback
      'others'
    ],
    default: 'unit',
    lowercase: true,
    trim: true
  },
  // 'others' সিলেক্ট করলে কাস্টম ইউনিট বা প্যাক সাইজ লেখার জন্য
  customPackSize: {
    type: String,
    trim: true,
    default: ''
  },
  // এক প্যাকে কয়টি আইটেম বা কত ইউনিট আছে
  packQuantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0.01
  },

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

// পুরনো কোনো জায়গায় product.price ব্যবহার করা হলে sellPrice রিটার্ন করবে
productSchema.virtual('price').get(function () {
  return this.sellPrice;
});

// প্যাক সাইজ ও কোয়ান্টিটি সহজে দেখানোর জন্য virtual field
productSchema.virtual('packLabel').get(function () {
  const unitLabel = this.packUnit === 'others' && this.customPackSize
    ? this.customPackSize
    : this.packUnit;
  return `${this.packQuantity} ${unitLabel}`.trim();
});

// বর্তমান স্টক দিয়ে মোট কত প্যাক হচ্ছে তার হিসাব
productSchema.virtual('totalPacks').get(function () {
  if (!this.packQuantity || this.packQuantity <= 0) return 0;
  return Number((this.quantity / this.packQuantity).toFixed(2));
});

module.exports = mongoose.model('Product', productSchema);