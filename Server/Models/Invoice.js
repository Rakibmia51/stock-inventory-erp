const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true }
    }
  ],
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  dueAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Partial', 'Due'], 
    default: 'Paid' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);