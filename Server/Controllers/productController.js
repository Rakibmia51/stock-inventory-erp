const Product = require('../Models/Product');

// ১. সব প্রোডাক্ট দেখা
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. নতুন প্রোডাক্ট যোগ করা
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      buyPrice,
      sellPrice,
      price,
      openingStock,
      quantity,
      minStockLevel
    } = req.body;

    const parsedBuyPrice = Number(buyPrice ?? 0);
    const parsedSellPrice = Number(sellPrice ?? price ?? 0);
    const initialQty = Number(openingStock ?? quantity ?? 0);

    const product = await Product.create({
      name,
      sku,
      category,
      buyPrice: parsedBuyPrice,
      sellPrice: parsedSellPrice,
      openingStock: initialQty,
      purchasedQty: 0,
      soldQty: 0,
      returnedQty: 0,
      quantity: initialQty,
      minStockLevel: Number(minStockLevel) ?? 5
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ৩. স্টক ইন / আউট আপডেট করা
// const updateStock = async (req, res) => {
//   try {
//     const { type, amount } = req.body; // type: 'IN' অথবা 'OUT'
//     const product = await Product.findById(req.params.id);
    
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     const qtyChange = Number(amount);
//     if (type === 'IN') {
//       product.quantity += qtyChange;
//     } else if (type === 'OUT') {
//       if (product.quantity < qtyChange) {
//         return res.status(400).json({ message: 'পর্যাপ্ত স্টক নেই!' });
//       }
//       product.quantity -= qtyChange;
//     }

//     await product.save();
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount } = req.body;
    const qty = Number(amount);

    if (!qty || qty <= 0) {
      return res.status(400).json({ message: 'Valid positive amount is required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const movementType = (type || '').toUpperCase();

    if (movementType === 'IN') {
      // IN = Purchase
      product.purchasedQty = (product.purchasedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
    } else if (movementType === 'OUT') {
      // OUT = Invoice Sell
      if ((product.quantity || 0) < qty) {
        return res.status(400).json({ message: 'Insufficient stock for Invoice Sell' });
      }
      product.soldQty = (product.soldQty || 0) + qty;
      product.quantity = (product.quantity || 0) - qty;
    } else if (movementType === 'RETURN') {
      // Return (Sales Return -> stock increases)
      product.returnedQty = (product.returnedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
    } else {
      return res.status(400).json({ message: 'Invalid stock movement type' });
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৪. প্রোডাক্ট ডিলিট করা
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// রিটার্নের জন্য আলাদা ডেডিকেটেড ফাংশন
const handleProductReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnType, amount, reason } = req.body;
    const qty = Number(amount);

    if (!qty || qty <= 0) {
      return res.status(400).json({ message: 'Valid return quantity is required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (returnType === 'PURCHASE_RETURN') {
      // সাপ্লায়ারকে ফেরত দিলে বর্তমান স্টক থেকে কমবে
      if ((product.quantity || 0) < qty) {
        return res.status(400).json({ message: 'Insufficient stock to return to supplier' });
      }
      product.returnedQty = (product.returnedQty || 0) - qty;
      product.quantity = (product.quantity || 0) - qty;
    } else {
      // SALES_RETURN: কাস্টমার ফেরত দিলে বর্তমান স্টকে যোগ হবে
      product.returnedQty = (product.returnedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
    }

    await product.save();
    res.json({ message: 'Product return recorded successfully', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateStock,
  deleteProduct,
  handleProductReturn
};