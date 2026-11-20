// const mongoose = require('mongoose');

// const supplierSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   companyName: { type: String, required: true },
//   phone: { type: String, required: true },
//   email: { type: String },
//   address: { type: String }
// }, { timestamps: true });

// module.exports = mongoose.model('Supplier', supplierSchema);


const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    openingBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    dueBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);