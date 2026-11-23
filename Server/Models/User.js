const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { 
    type: String, 
    enum: ['admin', 'staff', 'others'], 
    default: 'staff' 
  },
  // চেক বক্সের পারমিশনসমূহ
  permissions: {
    products: { type: Boolean, default: false },
    suppliers: { type: Boolean, default: false },
    clients: { type: Boolean, default: false },
    purchases: { type: Boolean, default: false },
    invoices: { type: Boolean, default: false },
    accounts: { type: Boolean, default: false },
    users:{type: Boolean, default: false}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);