const StockReturn = require('../Models/StockReturn');
const Product = require('../Models/Product');

// ১. সব রিটার্ন রেকর্ড দেখা
const getReturns = async (req, res) => {
  try {
    const returns = await StockReturn.find()
      .populate('product', 'name sku category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. নতুন Return এন্ট্রি এবং স্টক লেজার আপডেট
const createReturn = async (req, res) => {
  try {
    const { productId, returnType, amount, reason } = req.body;
    const qty = Number(amount);

    if (!productId || !qty || qty <= 0) {
      return res.status(400).json({ message: 'Valid product and positive return quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const type = (returnType || 'SALES_RETURN').toUpperCase();

    if (type === 'PURCHASE_RETURN') {
      // সাপ্লায়ারকে পণ্য ফেরত দিলে Current Stock থেকে কমবে
      if ((product.quantity || 0) < qty) {
        return res.status(400).json({
          message: `Insufficient stock to return to supplier. Available: ${product.quantity}`
        });
      }
      product.returnedQty = (product.returnedQty || 0) - qty;
      product.quantity = (product.quantity || 0) - qty;
    } else if (type === 'SALES_RETURN') {
      // কাস্টমার পণ্য ফেরত দিলে Return ও Current Stock বাড়বে
      product.returnedQty = (product.returnedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
    } else {
      return res.status(400).json({ message: 'Invalid return type' });
    }

    await product.save();

    const count = await StockReturn.countDocuments();
    const returnNumber = `RET-${2001 + count}`;

    const stockReturn = await StockReturn.create({
      returnNumber,
      returnType: type,
      product: product._id,
      quantity: qty,
      reason: reason || '',
      createdBy: req.user?._id
    });

    res.status(201).json({
      message: 'Return recorded and stock updated successfully',
      stockReturn,
      product
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReturns, createReturn };