
const Invoice = require('../Models/Invoice');
const Product = require('../Models/Product');
const Client = require('../Models/Client');

// ১. সব ইনভয়েস দেখা
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('client', 'companyName name phone address dueBalance')
      .populate('items.product', 'name sku buyPrice sellPrice')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. নতুন ইনভয়েস তৈরি, স্টক (Sell OUT) এবং কাস্টমারের Due আপডেট করা
const createInvoice = async (req, res) => {
  try {
    const {
      client,
      items,
      discount = 0,
      paidAmount = 0,
      paymentMethod = 'Cash',
      mobileProvider = '',
      notes = ''
    } = req.body;

    if (!client) {
      return res.status(400).json({ message: 'Client is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invoice must contain at least one item' });
    }

    const clientDoc = await Client.findById(client);
    if (!clientDoc) {
      return res.status(404).json({ message: 'Client not found' });
    }

    let subTotal = 0;
    let totalCost = 0;
    const preparedItems = [];

    for (const item of items) {
      const productId = item?.product?._id || item?.product;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: 'Invalid or missing product in invoice items' });
      }

      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
      }

      if (Number(product.quantity || 0) < qty) {
        return res.status(400).json({
          message: `${product.name}-এর পর্যাপ্ত স্টক নেই! (বর্তমান স্টক: ${product.quantity})`
        });
      }

      const unitPrice = Number(item.unitPrice ?? product.sellPrice ?? product.price ?? 0);
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
        buyPrice: unitBuyPrice,
        buyPriceAtSale: unitBuyPrice,
        total: lineTotal,
        lineTotal,
        profitAmount: lineProfit
      });
    }

    for (const pItem of preparedItems) {
      await Product.findByIdAndUpdate(pItem.product, {
        $inc: {
          soldQty: pItem.quantity,
          quantity: -pItem.quantity
        }
      });
    }

    const parsedDiscount = Math.max(0, Number(discount) || 0);
    const parsedPaidAmount = Math.max(0, Number(paidAmount) || 0);
    const grandTotal = Math.max(0, subTotal - parsedDiscount);
    const dueAmount = Math.max(0, grandTotal - parsedPaidAmount);
    const netProfit = grandTotal - totalCost;

    let paymentStatus = 'Paid';
    if (grandTotal > 0 && dueAmount >= grandTotal) paymentStatus = 'Due';
    else if (dueAmount > 0) paymentStatus = 'Partial';

    const allowedMethods = ['Cash', 'Bank', 'Mobile Banking', 'Adjustment'];
    const allowedProviders = ['', 'bKash', 'Nagad', 'Rocket', 'Upay'];
    const safeMethod = allowedMethods.includes(paymentMethod) ? paymentMethod : 'Cash';
    const safeProvider =
      safeMethod === 'Mobile Banking' && allowedProviders.includes(mobileProvider)
        ? mobileProvider
        : '';

    // ইউনিক ইনভয়েস নম্বর তৈরি (ডুপ্লিকেট হলে রিট্রাই)
    let savedInvoice = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const totalDocs = await Invoice.countDocuments();
      const invoiceNumber = `INV-${1001 + totalDocs + attempt}`;

      try {
        const newInvoice = new Invoice({
          invoiceNumber,
          client: clientDoc._id,
          items: preparedItems,
          subTotal,
          discount: parsedDiscount,
          grandTotal,
          paidAmount: parsedPaidAmount,
          dueAmount,
          totalCost,
          netProfit,
          paymentMethod: safeMethod,
          mobileProvider: safeProvider,
          paymentStatus,
          status: 'Active',
          notes: typeof notes === 'string' ? notes.trim() : ''
        });

        savedInvoice = await newInvoice.save();
        break;
      } catch (saveErr) {
        if (saveErr?.code === 11000 && attempt < 4) {
          continue;
        }
        throw saveErr;
      }
    }

    if (dueAmount > 0) {
      await Client.findByIdAndUpdate(clientDoc._id, {
        $inc: { dueBalance: dueAmount }
      });
    }

    const populatedInvoice = await Invoice.findById(savedInvoice._id)
      .populate('client', 'companyName name phone address dueBalance')
      .populate('items.product', 'name sku buyPrice sellPrice');

    res.status(201).json(populatedInvoice);
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

    for (const item of invoice.items) {
      const qty = Number(item.quantity || 0);
      const productId = item?.product?._id || item?.product;
      const product = productId ? await Product.findById(productId) : null;
      if (product) {
        const currentSold = Number(product.soldQty || 0);
        const deductSold = Math.min(currentSold, qty);
        product.soldQty = currentSold - deductSold;
        product.quantity = Number(product.quantity || 0) + qty;
        await product.save();
      }
    }

    const invDue = Number(invoice.dueAmount || 0);
    const clientId = invoice?.client?._id || invoice?.client;
    if (invDue > 0 && clientId) {
      const clientDoc = await Client.findById(clientId);
      if (clientDoc) {
        clientDoc.dueBalance = Math.max(0, Number(clientDoc.dueBalance || 0) - invDue);
        await clientDoc.save();
      }
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted and stock restored successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInvoices, createInvoice, deleteInvoice };