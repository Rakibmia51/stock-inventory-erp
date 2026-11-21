const AccountTransaction = require('../Models/AccountTransaction');
const Client = require('../Models/Client');
const Supplier = require('../Models/Supplier');

const getTransactions = async (req, res) => {
  try {
    const transactions = await AccountTransaction.find()
      .populate('client', 'name phone dueBalance')
      .populate('supplier', 'companyName name phone dueBalance')
      .sort({ transactionDate: -1, createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const {
      entryType,
      clientId,
      supplierId,
      category,
      title,
      amount,
      paymentMethod = 'Cash',
      mobileProvider = '',
      reference = '',
      note = '',
      transactionDate
    } = req.body;

    const validTypes = [
      'INCOME',
      'EXPENSE',
      'OTHERS',
      'DUE_COLLECTION',
      'SUPPLIER_PAYMENT'
    ];
    if (!validTypes.includes(entryType)) {
      return res.status(400).json({ message: 'Invalid entry type' });
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    let partyType = 'NONE';
    let resolvedClient = null;
    let resolvedSupplier = null;
    let resolvedCategory = category?.trim() || 'General';
    let resolvedTitle = title?.trim() || '';

    // কাস্টমার বকেয়া আদায় (Accounts Receivable কমে)
    if (entryType === 'DUE_COLLECTION') {
      if (!clientId) {
        return res.status(400).json({ message: 'Client is required for due collection' });
      }
      const clientDoc = await Client.findById(clientId);
      if (!clientDoc) {
        return res.status(404).json({ message: 'Client not found' });
      }

      const currentDue = Number(clientDoc.dueBalance || 0);
      if (numericAmount > currentDue) {
        return res.status(400).json({
          message: `Collection amount (৳${numericAmount}) cannot exceed client due (৳${currentDue})`
        });
      }

      clientDoc.dueBalance = Math.max(0, currentDue - numericAmount);
      await clientDoc.save();

      partyType = 'CLIENT';
      resolvedClient = clientDoc._id;
      resolvedCategory = resolvedCategory || 'Due Collection';
      resolvedTitle = resolvedTitle || `Due received from ${clientDoc.name}`;
    }

    // সাপ্লায়ার পেমেন্ট (Accounts Payable কমে)
    if (entryType === 'SUPPLIER_PAYMENT') {
      if (!supplierId) {
        return res.status(400).json({ message: 'Supplier is required for supplier payment' });
      }
      const supplierDoc = await Supplier.findById(supplierId);
      if (!supplierDoc) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      const currentDue = Number(supplierDoc.dueBalance || 0);
      if (numericAmount > currentDue) {
        return res.status(400).json({
          message: `Payment amount (৳${numericAmount}) cannot exceed supplier payable (৳${currentDue})`
        });
      }

      supplierDoc.dueBalance = Math.max(0, currentDue - numericAmount);
      await supplierDoc.save();

      partyType = 'SUPPLIER';
      resolvedSupplier = supplierDoc._id;
      resolvedCategory = resolvedCategory || 'Supplier Payment';
      resolvedTitle =
        resolvedTitle || `Paid to ${supplierDoc.companyName || supplierDoc.name}`;
    }

    const prefixMap = {
      INCOME: 'INC',
      EXPENSE: 'EXP',
      OTHERS: 'OTH',
      DUE_COLLECTION: 'MR',
      SUPPLIER_PAYMENT: 'PV'
    };

    const count = await AccountTransaction.countDocuments();
    const voucherNumber = `${prefixMap[entryType]}-${3001 + count}`;

    const created = await AccountTransaction.create({
      voucherNumber,
      entryType,
      partyType,
      client: resolvedClient,
      supplier: resolvedSupplier,
      category: resolvedCategory,
      title: resolvedTitle,
      amount: numericAmount,
      paymentMethod,
      mobileProvider: paymentMethod === 'Mobile Banking' ? mobileProvider : '',
      reference: reference?.trim() || '',
      note: note?.trim() || '',
      transactionDate: transactionDate ? new Date(transactionDate) : new Date()
    });

    const populated = await AccountTransaction.findById(created._id)
      .populate('client', 'name phone dueBalance')
      .populate('supplier', 'companyName name phone dueBalance');

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// এন্ট্রি ডিলিট করলে Due Collection / Supplier Payment বকেয়াও রিভার্স হবে
const deleteTransaction = async (req, res) => {
  try {
    const tx = await AccountTransaction.findById(req.params.id);
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (tx.entryType === 'DUE_COLLECTION' && tx.client) {
      await Client.findByIdAndUpdate(tx.client, {
        $inc: { dueBalance: Number(tx.amount || 0) }
      });
    }

    if (tx.entryType === 'SUPPLIER_PAYMENT' && tx.supplier) {
      await Supplier.findByIdAndUpdate(tx.supplier, {
        $inc: { dueBalance: Number(tx.amount || 0) }
      });
    }

    await AccountTransaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted and balances adjusted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  deleteTransaction
};