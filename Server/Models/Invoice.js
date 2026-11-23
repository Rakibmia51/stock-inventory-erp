
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
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
        unitPrice: { type: Number, required: true, min: 0 },
        buyPrice: { type: Number, default: 0 }, // COGS snapshot at sale time
        buyPriceAtSale: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        lineTotal: { type: Number, default: 0 },
        profitAmount: { type: Number, default: 0 }
      }
    ],
    subTotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank', 'Mobile Banking', 'Adjustment'],
      default: 'Cash'
    },
    mobileProvider: {
      type: String,
      enum: ['', 'bKash', 'Nagad', 'Rocket', 'Upay'],
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Due'],
      default: 'Paid'
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Void'],
      default: 'Active'
    },
    notes: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

// Auto-calculate dueAmount and paymentStatus before validation (Mongoose 8/9 compatible)
invoiceSchema.pre('validate', async function () {
  const grand = Number(this.grandTotal || 0);
  const paid = Number(this.paidAmount || 0);
  const computedDue = Math.max(0, grand - paid);

  this.dueAmount = computedDue;

  if (computedDue <= 0 && grand > 0) {
    this.paymentStatus = 'Paid';
  } else if (paid > 0 && computedDue > 0) {
    this.paymentStatus = 'Partial';
  } else {
    this.paymentStatus = 'Due';
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);