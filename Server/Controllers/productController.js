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
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ৩. স্টক ইন / আউট আপডেট করা
const updateStock = async (req, res) => {
  try {
    const { type, amount } = req.body; // type: 'IN' অথবা 'OUT'
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const qtyChange = Number(amount);
    if (type === 'IN') {
      product.quantity += qtyChange;
    } else if (type === 'OUT') {
      if (product.quantity < qtyChange) {
        return res.status(400).json({ message: 'পর্যাপ্ত স্টক নেই!' });
      }
      product.quantity -= qtyChange;
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

module.exports = {
  getProducts,
  createProduct,
  updateStock,
  deleteProduct
};