// const AccountTransaction = require('../Models/AccountTransaction');
// const Client = require('../Models/Client');
// const Supplier = require('../Models/Supplier');

// const getTransactions = async (req, res) => {
//   try {
//     const transactions = await AccountTransaction.find()
//       .populate('client', 'name phone dueBalance')
//       .populate('supplier', 'companyName name phone dueBalance')
//       .sort({ transactionDate: -1, createdAt: -1 });

//     res.json(transactions);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const createTransaction = async (req, res) => {
//   try {
//     const {
//       entryType,
//       clientId,
//       supplierId,
//       category,
//       title,
//       amount,
//       paymentMethod = 'Cash',
//       mobileProvider = '',
//       reference = '',
//       note = '',
//       transactionDate
//     } = req.body;

//     const validTypes = [
//       'INCOME',
//       'EXPENSE',
//       'OTHERS',
//       'DUE_COLLECTION',
//       'SUPPLIER_PAYMENT'
//     ];
//     if (!validTypes.includes(entryType)) {
//       return res.status(400).json({ message: 'Invalid entry type' });
//     }

//     const numericAmount = Number(amount);
//     if (!numericAmount || numericAmount <= 0) {
//       return res.status(400).json({ message: 'Amount must be greater than 0' });
//     }

//     let partyType = 'NONE';
//     let resolvedClient = null;
//     let resolvedSupplier = null;
//     let resolvedCategory = category?.trim() || 'General';
//     let resolvedTitle = title?.trim() || '';

//     // কাস্টমার বকেয়া আদায় (Accounts Receivable কমে)
//     if (entryType === 'DUE_COLLECTION') {
//       if (!clientId) {
//         return res.status(400).json({ message: 'Client is required for due collection' });
//       }
//       const clientDoc = await Client.findById(clientId);
//       if (!clientDoc) {
//         return res.status(404).json({ message: 'Client not found' });
//       }

//       const currentDue = Number(clientDoc.dueBalance || 0);
//       if (numericAmount > currentDue) {
//         return res.status(400).json({
//           message: `Collection amount (৳${numericAmount}) cannot exceed client due (৳${currentDue})`
//         });
//       }

//       clientDoc.dueBalance = Math.max(0, currentDue - numericAmount);
//       await clientDoc.save();

//       partyType = 'CLIENT';
//       resolvedClient = clientDoc._id;
//       resolvedCategory = resolvedCategory || 'Due Collection';
//       resolvedTitle = resolvedTitle || `Due received from ${clientDoc.name}`;
//     }

//     // সাপ্লায়ার পেমেন্ট (Accounts Payable কমে)
//     if (entryType === 'SUPPLIER_PAYMENT') {
//       if (!supplierId) {
//         return res.status(400).json({ message: 'Supplier is required for supplier payment' });
//       }
//       const supplierDoc = await Supplier.findById(supplierId);
//       if (!supplierDoc) {
//         return res.status(404).json({ message: 'Supplier not found' });
//       }

//       const currentDue = Number(supplierDoc.dueBalance || 0);
//       if (numericAmount > currentDue) {
//         return res.status(400).json({
//           message: `Payment amount (৳${numericAmount}) cannot exceed supplier payable (৳${currentDue})`
//         });
//       }

//       supplierDoc.dueBalance = Math.max(0, currentDue - numericAmount);
//       await supplierDoc.save();

//       partyType = 'SUPPLIER';
//       resolvedSupplier = supplierDoc._id;
//       resolvedCategory = resolvedCategory || 'Supplier Payment';
//       resolvedTitle =
//         resolvedTitle || `Paid to ${supplierDoc.companyName || supplierDoc.name}`;
//     }

//     const prefixMap = {
//       INCOME: 'INC',
//       EXPENSE: 'EXP',
//       OTHERS: 'OTH',
//       DUE_COLLECTION: 'MR',
//       SUPPLIER_PAYMENT: 'PV'
//     };

//     const count = await AccountTransaction.countDocuments();
//     const voucherNumber = `${prefixMap[entryType]}-${3001 + count}`;

//     const created = await AccountTransaction.create({
//       voucherNumber,
//       entryType,
//       partyType,
//       client: resolvedClient,
//       supplier: resolvedSupplier,
//       category: resolvedCategory,
//       title: resolvedTitle,
//       amount: numericAmount,
//       paymentMethod,
//       mobileProvider: paymentMethod === 'Mobile Banking' ? mobileProvider : '',
//       reference: reference?.trim() || '',
//       note: note?.trim() || '',
//       transactionDate: transactionDate ? new Date(transactionDate) : new Date()
//     });

//     const populated = await AccountTransaction.findById(created._id)
//       .populate('client', 'name phone dueBalance')
//       .populate('supplier', 'companyName name phone dueBalance');

//     res.status(201).json(populated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // এন্ট্রি ডিলিট করলে Due Collection / Supplier Payment বকেয়াও রিভার্স হবে
// const deleteTransaction = async (req, res) => {
//   try {
//     const tx = await AccountTransaction.findById(req.params.id);
//     if (!tx) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }

//     if (tx.entryType === 'DUE_COLLECTION' && tx.client) {
//       await Client.findByIdAndUpdate(tx.client, {
//         $inc: { dueBalance: Number(tx.amount || 0) }
//       });
//     }

//     if (tx.entryType === 'SUPPLIER_PAYMENT' && tx.supplier) {
//       await Supplier.findByIdAndUpdate(tx.supplier, {
//         $inc: { dueBalance: Number(tx.amount || 0) }
//       });
//     }

//     await AccountTransaction.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Transaction deleted and balances adjusted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = {
//   getTransactions,
//   createTransaction,
//   deleteTransaction
// };


const AccountTransaction = require('../Models/AccountTransaction');
const Client = require('../Models/Client');
const Supplier = require('../Models/Supplier');

const VALID_ENTRY_TYPES = [
  'INCOME',
  'EXPENSE',
  'OTHERS',
  'DUE_COLLECTION',
  'SUPPLIER_PAYMENT'
];

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

    if (!VALID_ENTRY_TYPES.includes(entryType)) {
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

    // কাস্টমার বকেয়া আদায় (Accounts Receivable কমে)
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

    // সাপ্লায়ার পেমেন্ট (Accounts Payable কমে)
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

// ট্রানজেকশন এডিট করলে পুরনো বকেয়া রিভার্স করে নতুন এন্ট্রি অনুযায়ী ব্যালেন্স সমন্বয় হবে
const updateTransaction = async (req, res) => {
  try {
    const tx = await AccountTransaction.findById(req.params.id);
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const nextEntryType = req.body.entryType ?? tx.entryType;
    if (!VALID_ENTRY_TYPES.includes(nextEntryType)) {
      return res.status(400).json({ message: 'Invalid entry type' });
    }

    const nextAmount =
      req.body.amount !== undefined ? Number(req.body.amount) : Number(tx.amount || 0);
    if (!nextAmount || nextAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const oldAmount = Number(tx.amount || 0);

    // ১. আগে পুরনো DUE_COLLECTION / SUPPLIER_PAYMENT এর প্রভাব রিভার্স করুন
    if (tx.entryType === 'DUE_COLLECTION' && tx.client) {
      await Client.findByIdAndUpdate(tx.client, {
        $inc: { dueBalance: oldAmount }
      });
    }

    if (tx.entryType === 'SUPPLIER_PAYMENT' && tx.supplier) {
      await Supplier.findByIdAndUpdate(tx.supplier, {
        $inc: { dueBalance: oldAmount }
      });
    }

    let partyType = 'NONE';
    let resolvedClient = null;
    let resolvedSupplier = null;
    let resolvedCategory =
      req.body.category !== undefined
        ? String(req.body.category || '').trim() || 'General'
        : tx.category || 'General';
    let resolvedTitle =
      req.body.title !== undefined ? String(req.body.title || '').trim() : tx.title || '';

    // ২. নতুন DUE_COLLECTION হলে Client due চেক ও আপডেট করুন
    if (nextEntryType === 'DUE_COLLECTION') {
      const targetClientId =
        req.body.clientId !== undefined ? req.body.clientId : tx.client;
      if (!targetClientId) {
        if (tx.entryType === 'DUE_COLLECTION' && tx.client) {
          await Client.findByIdAndUpdate(tx.client, { $inc: { dueBalance: -oldAmount } });
        }
        return res.status(400).json({ message: 'Client is required for due collection' });
      }

      const clientDoc = await Client.findById(targetClientId);
      if (!clientDoc) {
        if (tx.entryType === 'DUE_COLLECTION' && tx.client) {
          await Client.findByIdAndUpdate(tx.client, { $inc: { dueBalance: -oldAmount } });
        }
        return res.status(404).json({ message: 'Client not found' });
      }

      const availableDue = Number(clientDoc.dueBalance || 0);
      if (nextAmount > availableDue) {
        if (tx.entryType === 'DUE_COLLECTION' && tx.client) {
          await Client.findByIdAndUpdate(tx.client, { $inc: { dueBalance: -oldAmount } });
        }
        return res.status(400).json({
          message: `Collection amount (৳${nextAmount}) cannot exceed client due (৳${availableDue})`
        });
      }

      clientDoc.dueBalance = Math.max(0, availableDue - nextAmount);
      await clientDoc.save();

      partyType = 'CLIENT';
      resolvedClient = clientDoc._id;
      resolvedCategory = resolvedCategory || 'Due Collection';
      resolvedTitle = resolvedTitle || `Due received from ${clientDoc.name}`;
    }

    // ৩. নতুন SUPPLIER_PAYMENT হলে Supplier due চেক ও আপডেট করুন
    if (nextEntryType === 'SUPPLIER_PAYMENT') {
      const targetSupplierId =
        req.body.supplierId !== undefined ? req.body.supplierId : tx.supplier;
      if (!targetSupplierId) {
        if (tx.entryType === 'SUPPLIER_PAYMENT' && tx.supplier) {
          await Supplier.findByIdAndUpdate(tx.supplier, { $inc: { dueBalance: -oldAmount } });
        }
        return res.status(400).json({ message: 'Supplier is required for supplier payment' });
      }

      const supplierDoc = await Supplier.findById(targetSupplierId);
      if (!supplierDoc) {
        if (tx.entryType === 'SUPPLIER_PAYMENT' && tx.supplier) {
          await Supplier.findByIdAndUpdate(tx.supplier, { $inc: { dueBalance: -oldAmount } });
        }
        return res.status(404).json({ message: 'Supplier not found' });
      }

      const availablePayable = Number(supplierDoc.dueBalance || 0);
      if (nextAmount > availablePayable) {
        if (tx.entryType === 'SUPPLIER_PAYMENT' && tx.supplier) {
          await Supplier.findByIdAndUpdate(tx.supplier, { $inc: { dueBalance: -oldAmount } });
        }
        return res.status(400).json({
          message: `Payment amount (৳${nextAmount}) cannot exceed supplier payable (৳${availablePayable})`
        });
      }

      supplierDoc.dueBalance = Math.max(0, availablePayable - nextAmount);
      await supplierDoc.save();

      partyType = 'SUPPLIER';
      resolvedSupplier = supplierDoc._id;
      resolvedCategory = resolvedCategory || 'Supplier Payment';
      resolvedTitle =
        resolvedTitle || `Paid to ${supplierDoc.companyName || supplierDoc.name}`;
    }

    const nextPaymentMethod = req.body.paymentMethod ?? tx.paymentMethod ?? 'Cash';
    const nextMobileProvider =
      nextPaymentMethod === 'Mobile Banking'
        ? (req.body.mobileProvider ?? tx.mobileProvider ?? '')
        : '';

    tx.entryType = nextEntryType;
    tx.partyType = partyType;
    tx.client = resolvedClient;
    tx.supplier = resolvedSupplier;
    tx.category = resolvedCategory;
    tx.title = resolvedTitle;
    tx.amount = nextAmount;
    tx.paymentMethod = nextPaymentMethod;
    tx.mobileProvider = nextMobileProvider;
    if (req.body.reference !== undefined) {
      tx.reference = String(req.body.reference || '').trim();
    }
    if (req.body.note !== undefined) {
      tx.note = String(req.body.note || '').trim();
    }
    if (req.body.transactionDate !== undefined && req.body.transactionDate) {
      tx.transactionDate = new Date(req.body.transactionDate);
    }

    await tx.save();

    const populated = await AccountTransaction.findById(tx._id)
      .populate('client', 'name phone dueBalance')
      .populate('supplier', 'companyName name phone dueBalance');

    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// এন্ট্রি ডিলিট করলে Due Collection / Supplier Payment বকেয়াও রিভার্স হবে
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
  updateTransaction,
  deleteTransaction
};