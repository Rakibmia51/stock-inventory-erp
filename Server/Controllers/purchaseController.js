const Purchase = require('../Models/Purchase');
const Product = require('../Models/Product');

// ১. সব পারচেজ অর্ডার দেখা
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplier', 'name companyName phone')
      .populate('items.product', 'name sku buyPrice sellPrice')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. নতুন পারচেজ অর্ডার তৈরি এবং স্টক (Purchase IN, Current Stock & buyPrice) আপডেট করা
const createPurchase = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required for purchase order' });
    }

    let totalAmount = 0;

    // প্রতিটি আইটেম যাচাই ও মোট মূল্য হিসাব করা
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found with ID: ${item.product}` });
      }

      const qty = Number(item.quantity);
      const unitBuyPrice = Number(item.purchasePrice);

      if (!qty || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
      }

      totalAmount += qty * unitBuyPrice;

      // Purchase (IN), Current Stock এবং সর্বশেষ buyPrice আপডেট করা
      if (unitBuyPrice > 0) {
        product.buyPrice = unitBuyPrice;
      }
      product.purchasedQty = (product.purchasedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
      await product.save();
    }

    // পারচেজ রেকর্ড সেভ করা
    const newPurchase = new Purchase({
      supplier,
      items,
      totalAmount,
      status: 'Received'
    });

    const savedPurchase = await newPurchase.save();
    res.status(201).json({
      message: 'Purchase Order created successfully and stock updated!',
      savedPurchase
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ৩. পারচেজ অর্ডার ডিলিট এবং স্টক রিভার্স করা
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // আগে স্টক যথেষ্ট আছে কি না যাচাই করা (যাতে নেগেটিভ স্টক না হয়)
    for (const item of purchase.items) {
      const qty = Number(item.quantity || 0);
      const product = await Product.findById(item.product);
      if (product && (product.quantity || 0) < qty) {
        return res.status(400).json({
          message: `Cannot delete: ${product.name} already has fewer stock (${product.quantity}) than purchase qty (${qty})`
        });
      }
    }

    // আগে দেওয়া Purchase (IN) ও Current Stock রিভার্স করা
    for (const item of purchase.items) {
      const qty = Number(item.quantity || 0);
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          purchasedQty: -qty,
          quantity: -qty
        }
      });
    }

    await purchase.deleteOne();
    res.json({ message: 'Purchase deleted and stock reversed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPurchases, createPurchase, deletePurchase };