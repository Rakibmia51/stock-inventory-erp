const Supplier = require('../Models/Supplier');

// সব সাপ্লায়ার দেখা
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// নতুন সাপ্লায়ার যোগ করা
const createSupplier = async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// সাপ্লায়ার ডিলিট করা
const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSuppliers, createSupplier, deleteSupplier };