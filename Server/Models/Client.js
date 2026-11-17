const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  dueBalance: { type: Number, default: 0 } // কাস্টমারের বকেয়া টাকার হিসাব
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);