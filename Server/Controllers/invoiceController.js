const Invoice = require('../Models/Invoice');
const Product = require('../Models/Product');
const Client = require('../Models/Client');

// ১. সব ইনভয়েস দেখা
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('client', 'name phone address')
      .populate('items.product', 'name sku buyPrice sellPrice')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. নতুন ইনভয়েস তৈরি, স্টক (Sell OUT), Profit/Loss হিসাব এবং কাস্টমারের Due আপডেট করা
const createInvoice = async (req, res) => {
  try {
    const { client, items, discount = 0, paidAmount = 0, staffId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invoice must contain at least one item' });
    }

    let subTotal = 0;
    let totalCost = 0;
    const preparedItems = [];

    // ধাপ ১: আগে সব প্রোডাক্টের স্টক যাচাই করা ও হিসাব প্রস্তুত করা
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }

      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
      }

      if ((product.quantity || 0) < qty) {
        return res.status(400).json({
          message: `${product.name}-এর পর্যাপ্ত স্টক নেই! (বর্তমান স্টক: ${product.quantity})`
        });
      }

      const unitPrice = Number(item.unitPrice ?? product.sellPrice ?? 0);
      const unitBuyPrice = Number(product.buyPrice ?? 0);

      const lineTotal = qty * unitPrice;
      const lineCost = qty * unitBuyPrice;
      const lineProfit = lineTotal - lineCost;

      subTotal += lineTotal;
      totalCost += lineCost;

      preparedItems.push({
        product: product._id,
        quantity: qty,
        unitPrice,
        buyPriceAtSale: unitBuyPrice,
        lineTotal,
        profitAmount: lineProfit
      });
    }

    // ধাপ ২: স্টক নিশ্চিত হওয়ার পর প্রতিটি আইটেমের Sell (OUT) বাড়ানো ও Current Stock কমানো
    for (const pItem of preparedItems) {
      await Product.findByIdAndUpdate(pItem.product, {
        $inc: {
          soldQty: pItem.quantity,
          quantity: -pItem.quantity
        }
      });
    }

    const parsedDiscount = Number(discount) || 0;
    const parsedPaidAmount = Number(paidAmount) || 0;
    const grandTotal = Math.max(0, subTotal - parsedDiscount);
    const dueAmount = Math.max(0, grandTotal - parsedPaidAmount);
    const netProfit = grandTotal - totalCost;

    let paymentStatus = 'Paid';
    if (grandTotal > 0 && dueAmount >= grandTotal) paymentStatus = 'Due';
    else if (dueAmount > 0) paymentStatus = 'Partial';

    // ইউনিক ইনভয়েস নম্বর তৈরি
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${1001 + count}`;

    const newInvoice = new Invoice({
      invoiceNumber,
      client,
      staffId: staffId || undefined,
      items: preparedItems,
      subTotal,
      discount: parsedDiscount,
      grandTotal,
      paidAmount: parsedPaidAmount,
      dueAmount,
      totalCost,
      netProfit,
      paymentStatus
    });

    const savedInvoice = await newInvoice.save();

    // কাস্টমারের বকেয়া (Due Balance) আপডেট করা
    if (dueAmount > 0 && client) {
      await Client.findByIdAndUpdate(client, { $inc: { dueBalance: dueAmount } });
    }

    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ৩. ইনভয়েস ডিলিট এবং স্টক ও Due রিভার্স করা
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // আগে কাটা Sell (OUT) ও Current Stock রিভার্স করা
    for (const item of invoice.items) {
      const qty = Number(item.quantity || 0);
      const product = await Product.findById(item.product);
      if (product) {
        const currentSold = Number(product.soldQty || 0);
        const deductSold = Math.min(currentSold, qty);
        product.soldQty = currentSold - deductSold;
        product.quantity = Number(product.quantity || 0) + qty;
        await product.save();
      }
    }

    // বকেয়া (Due) থাকলে Client-এর dueBalance থেকে বাদ দেওয়া
    if (Number(invoice.dueAmount || 0) > 0 && invoice.client) {
      await Client.findByIdAndUpdate(invoice.client, {
        $inc: { dueBalance: -Number(invoice.dueAmount) }
      });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted and stock restored successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInvoices, createInvoice, deleteInvoice };