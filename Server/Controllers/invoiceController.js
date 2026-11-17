const Invoice = require('../Models/Invoice');
const Product = require('../Models/Product');
const Client = require('../Models/Client');

// ১. সব ইনভয়েস দেখা
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('client', 'name phone address')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. নতুন ইনভয়েস তৈরি, স্টক কমানো এবং কাস্টমারের Due আপডেট করা
const createInvoice = async (req, res) => {
  try {
    const { client, items, discount = 0, paidAmount } = req.body;

    let subTotal = 0;

    // স্টক চেক এবং কমানো
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `${product.name}-এর পর্যাপ্ত স্টক নেই! (বর্তমান স্টক: ${product.quantity})` });
      }

      subTotal += item.quantity * item.unitPrice;
      product.quantity -= Number(item.quantity);
      await product.save();
    }

    const grandTotal = subTotal - Number(discount);
    const dueAmount = Math.max(0, grandTotal - Number(paidAmount));

    let paymentStatus = 'Paid';
    if (dueAmount === grandTotal) paymentStatus = 'Due';
    else if (dueAmount > 0) paymentStatus = 'Partial';

    // ইউনিক ইনভয়েস নম্বর তৈরি
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${1001 + count}`;

    const newInvoice = new Invoice({
      invoiceNumber,
      client,
      items,
      subTotal,
      discount,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentStatus
    });

    const savedInvoice = await newInvoice.save();

    // কাস্টমারের বকেয়া (Due Balance) আপডেট করা
    if (dueAmount > 0) {
      await Client.findByIdAndUpdate(client, { $inc: { dueBalance: dueAmount } });
    }

    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getInvoices, createInvoice };