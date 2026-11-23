const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'GLOBAL_ERP_SETTINGS', unique: true },
    companyName: { type: String, default: 'NEXUS ERP', trim: true },
    logoUrl: { type: String, default: '', trim: true },
    tagline: { type: String, default: 'Inventory, Sales & Accounting Suite', trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    taxId: { type: String, default: '', trim: true },
    currencySymbol: { type: String, default: '৳', trim: true },
    invoicePrefix: { type: String, default: 'INV', trim: true },
    invoiceFooter: { type: String, default: 'Thank you for your business.', trim: true },
    defaultMinStock: { type: Number, default: 5, min: 0 },
    defaultPaymentMethod: {
      type: String,
      enum: ['Cash', 'Bank', 'Mobile Banking'],
      default: 'Cash'
    },
    defaultMobileProvider: {
      type: String,
      enum: ['bKash', 'Nagad', 'Rocket', 'Upay'],
      default: 'bKash'
    },
    showSignatureOnPrint: { type: Boolean, default: true },
    autoReloadAfterAction: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);