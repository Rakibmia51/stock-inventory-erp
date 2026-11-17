const Purchase = require('../Models/Purchase');
const Product = require('../Models/Product');

// ১. সব পারচেজ অর্ডার দেখা
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplier', 'name companyName phone')
      .populate('items.product', 'name sku price')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. নতুন পারচেজ অর্ডার তৈরি এবং স্টক আপডেট করা
const createPurchase = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    let totalAmount = 0;

    // প্রতিটি আইটেমের মোট মূল্য হিসাব করা এবং স্টক আপডেট করা
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found with ID: ${item.product}` });
      }

      totalAmount += item.quantity * item.purchasePrice;

      // মূল প্রোডাক্টের স্টক বাড়িয়ে দেওয়া
      product.quantity += Number(item.quantity);
      // চাইলে ক্রয়ের উপর ভিত্তি করে প্রোডাক্টের বিক্রয়মূল্য বা পারচেজ প্রাইস আপডেট করতে পারেন
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

module.exports = { getPurchases, createPurchase };