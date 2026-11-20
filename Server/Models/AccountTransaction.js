const mongoose = require('mongoose');

const accountTransactionSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    entryType: {
      type: String,
      enum: ['INCOME', 'EXPENSE', 'OTHERS', 'DUE_COLLECTION', 'SUPPLIER_PAYMENT'],
      required: true
    },
    partyType: {
      type: String,
      enum: ['NONE', 'CLIENT', 'SUPPLIER'],
      default: 'NONE'
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank', 'Mobile Banking', 'Adjustment'],
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
    transactionDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AccountTransaction', accountTransactionSchema);