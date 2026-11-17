const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
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
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Received', 'Cancelled'], 
    default: 'Received' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);