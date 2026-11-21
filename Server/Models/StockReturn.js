const mongoose = require('mongoose');

const stockReturnSchema = new mongoose.Schema({
  returnNumber: { type: String, required: true, unique: true },
  returnType: {
    type: String,
    enum: ['SALES_RETURN', 'PURCHASE_RETURN'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: { type: Number, required: true, min: 1 },
  reason: { type: String, default: '' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('StockReturn', stockReturnSchema);