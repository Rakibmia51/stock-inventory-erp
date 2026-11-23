
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true, min: 1 },
        purchasePrice: { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank', 'Mobile Banking', 'Due'],
      default: 'Cash'
    },
    mobileProvider: {
      type: String,
      enum: ['', 'bKash', 'Nagad', 'Rocket', 'Upay', 'Other'],
      default: ''
    },
    reference: {
      type: String,
      trim: true,
      default: ''
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Received', 'Cancelled'],
      default: 'Received'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', purchaseSchema);