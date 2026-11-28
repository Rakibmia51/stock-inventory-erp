
// const Product = require('../Models/Product');

// // ১. সব প্রোডাক্ট দেখা
// const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ২. নতুন প্রোডাক্ট যোগ করা
// const createProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       sku,
//       barcode,
//       category,
//       buyPrice,
//       sellPrice,
//       price,
//       openingStock,
//       quantity,
//       minStockLevel,
//       minStock
//     } = req.body;

//     const cleanName = String(name || '').trim();
//     if (!cleanName) {
//       return res.status(400).json({ message: 'Product name is required' });
//     }

//     const cleanSku = String(sku || '').trim() || undefined;
//     const cleanBarcode = String(barcode || '').trim() || cleanSku || undefined;
//     const parsedBuyPrice = Math.max(0, Number(buyPrice ?? 0) || 0);
//     const parsedSellPrice = Math.max(0, Number(sellPrice ?? price ?? 0) || 0);
//     const initialQty = Math.max(0, Number(openingStock ?? quantity ?? 0) || 0);
//     const alertLimit = Math.max(0, Number(minStockLevel ?? minStock ?? 5) || 0);

//     const product = await Product.create({
//       name: cleanName,
//       sku: cleanSku,
//       barcode: cleanBarcode,
//       category: String(category || '').trim() || 'General',
//       buyPrice: parsedBuyPrice,
//       sellPrice: parsedSellPrice,
//       openingStock: initialQty,
//       purchasedQty: 0,
//       soldQty: 0,
//       returnedQty: 0,
//       quantity: initialQty,
//       minStockLevel: alertLimit
//     });

//     res.status(201).json(product);
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({ message: 'SKU or Barcode already exists' });
//     }
//     res.status(400).json({ message: err.message });
//   }
// };

// // ৩. বিদ্যমান প্রোডাক্ট আপডেট করা
// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     const {
//       name,
//       sku,
//       barcode,
//       category,
//       buyPrice,
//       sellPrice,
//       price,
//       quantity,
//       openingStock,
//       minStockLevel,
//       minStock
//     } = req.body;

//     if (name !== undefined) {
//       const cleanName = String(name).trim();
//       if (!cleanName) {
//         return res.status(400).json({ message: 'Product name cannot be empty' });
//       }
//       product.name = cleanName;
//     }

//     if (sku !== undefined) {
//       product.sku = String(sku).trim() || product.sku;
//     }

//     if (barcode !== undefined) {
//       product.barcode = String(barcode).trim() || product.sku || product.barcode;
//     }

//     if (category !== undefined) {
//       product.category = String(category).trim() || 'General';
//     }

//     if (buyPrice !== undefined) {
//       product.buyPrice = Math.max(0, Number(buyPrice) || 0);
//     }

//     if (sellPrice !== undefined || price !== undefined) {
//       product.sellPrice = Math.max(0, Number(sellPrice ?? price) || 0);
//     }

//     if (quantity !== undefined) {
//       const nextQty = Number(quantity);
//       if (Number.isNaN(nextQty) || nextQty < 0) {
//         return res.status(400).json({ message: 'Valid non-negative quantity is required' });
//       }
//       product.quantity = nextQty;
//     }

//     if (openingStock !== undefined) {
//       product.openingStock = Math.max(0, Number(openingStock) || 0);
//     }

//     if (minStockLevel !== undefined || minStock !== undefined) {
//       product.minStockLevel = Math.max(0, Number(minStockLevel ?? minStock) || 0);
//     }

//     await product.save();
//     res.json(product);
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({ message: 'SKU or Barcode already exists' });
//     }
//     res.status(400).json({ message: err.message });
//   }
// };

// // ৪. স্টক ইন / আউট আপডেট করা
// const updateStock = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { type, amount } = req.body;
//     const qty = Number(amount);

//     if (!qty || qty <= 0) {
//       return res.status(400).json({ message: 'Valid positive amount is required' });
//     }

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     const movementType = String(type || '').toUpperCase();

//     if (movementType === 'IN') {
//       product.purchasedQty = (product.purchasedQty || 0) + qty;
//       product.quantity = (product.quantity || 0) + qty;
//     } else if (movementType === 'OUT') {
//       if ((product.quantity || 0) < qty) {
//         return res.status(400).json({ message: 'Insufficient stock for Invoice Sell' });
//       }
//       product.soldQty = (product.soldQty || 0) + qty;
//       product.quantity = (product.quantity || 0) - qty;
//     } else if (movementType === 'RETURN') {
//       product.returnedQty = (product.returnedQty || 0) + qty;
//       product.quantity = (product.quantity || 0) + qty;
//     } else {
//       return res.status(400).json({ message: 'Invalid stock movement type' });
//     }

//     await product.save();
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ৫. প্রোডাক্ট ডিলিট করা
// const deleteProduct = async (req, res) => {
//   try {
//     const deleted = await Product.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     res.json({ message: 'Product deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ৬. রিটার্নের জন্য আলাদা ডেডিকেটেড ফাংশন
// const handleProductReturn = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { returnType, amount, reason } = req.body;
//     const qty = Number(amount);

//     if (!qty || qty <= 0) {
//       return res.status(400).json({ message: 'Valid return quantity is required' });
//     }

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     if (returnType === 'PURCHASE_RETURN') {
//       if ((product.quantity || 0) < qty) {
//         return res.status(400).json({ message: 'Insufficient stock to return to supplier' });
//       }
//       product.returnedQty = (product.returnedQty || 0) - qty;
//       product.quantity = (product.quantity || 0) - qty;
//     } else {
//       product.returnedQty = (product.returnedQty || 0) + qty;
//       product.quantity = (product.quantity || 0) + qty;
//     }

//     await product.save();
//     res.json({
//       message: 'Product return recorded successfully',
//       reason: reason || '',
//       product
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = {
//   getProducts,
//   createProduct,
//   updateProduct,
//   updateStock,
//   deleteProduct,
//   handleProductReturn
// };




const Product = require('../Models/Product');

const ALLOWED_PACK_UNITS = new Set([
  // Count & General
  'unit', 'pcs', 'pair', 'dozen', 'set',
  // Packaging & Bulk
  'pack', 'box', 'carton', 'bag', 'sack', 'bundle', 'roll', 'packet', 'pouch', 'jar', 'can', 'tin',
  // Weight
  'kg', 'gm', 'mg', 'ton', 'quintal', 'lb',
  // Liquid & Volume
  'liter', 'ml', 'bottle', 'gallon', 'drum',
  // Pharma & Medical
  'strip', 'tablet', 'capsule', 'vial', 'ampoule', 'syrup', 'tube', 'sachet', 'drop',
  // Length & Area
  'meter', 'cm', 'feet', 'inch', 'yard', 'sqft',
  // Custom Fallback
  'others'
]);

const normalizePackFields = (body = {}, existing = null) => {
  const rawUnit =
    body.packUnit !== undefined
      ? String(body.packUnit || '').trim().toLowerCase()
      : existing?.packUnit || 'unit';

  const packUnit = ALLOWED_PACK_UNITS.has(rawUnit) ? rawUnit : 'others';

  const rawCustomSize =
    body.customPackSize !== undefined
      ? String(body.customPackSize || '').trim()
      : existing?.customPackSize || '';

  const customPackSize = packUnit === 'others' ? rawCustomSize : '';

  const rawPackQty =
    body.packQuantity !== undefined
      ? Number(body.packQuantity)
      : existing?.packQuantity ?? 1;

  const packQuantity =
    Number.isFinite(rawPackQty) && rawPackQty > 0
      ? rawPackQty
      : existing?.packQuantity ?? 1;

  return { packUnit, customPackSize, packQuantity };
};

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
    const {
      name,
      sku,
      barcode,
      category,
      buyPrice,
      sellPrice,
      price,
      openingStock,
      quantity,
      minStockLevel,
      minStock
    } = req.body;

    const cleanName = String(name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const { packUnit, customPackSize, packQuantity } = normalizePackFields(req.body);

    if (packUnit === 'others' && !customPackSize) {
      return res
        .status(400)
        .json({ message: 'Custom pack size is required when packUnit is "others"' });
    }

    const cleanSku = String(sku || '').trim() || undefined;
    const cleanBarcode = String(barcode || '').trim() || cleanSku || undefined;
    const parsedBuyPrice = Math.max(0, Number(buyPrice ?? 0) || 0);
    const parsedSellPrice = Math.max(0, Number(sellPrice ?? price ?? 0) || 0);
    const initialQty = Math.max(0, Number(openingStock ?? quantity ?? 0) || 0);
    const alertLimit = Math.max(0, Number(minStockLevel ?? minStock ?? 5) || 0);

    const product = await Product.create({
      name: cleanName,
      sku: cleanSku,
      barcode: cleanBarcode,
      category: String(category || '').trim() || 'General',
      packUnit,
      customPackSize,
      packQuantity,
      buyPrice: parsedBuyPrice,
      sellPrice: parsedSellPrice,
      openingStock: initialQty,
      purchasedQty: 0,
      soldQty: 0,
      returnedQty: 0,
      quantity: initialQty,
      minStockLevel: alertLimit
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'SKU or Barcode already exists' });
    }
    res.status(400).json({ message: err.message });
  }
};

// ৩. বিদ্যমান প্রোডাক্ট আপডেট করা
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      sku,
      barcode,
      category,
      buyPrice,
      sellPrice,
      price,
      quantity,
      openingStock,
      minStockLevel,
      minStock
    } = req.body;

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!cleanName) {
        return res.status(400).json({ message: 'Product name cannot be empty' });
      }
      product.name = cleanName;
    }

    const { packUnit, customPackSize, packQuantity } = normalizePackFields(
      req.body,
      product
    );

    if (packUnit === 'others' && !customPackSize) {
      return res
        .status(400)
        .json({ message: 'Custom pack size is required when packUnit is "others"' });
    }

    product.packUnit = packUnit;
    product.customPackSize = customPackSize;
    product.packQuantity = packQuantity;

    if (sku !== undefined) {
      product.sku = String(sku).trim() || product.sku;
    }

    if (barcode !== undefined) {
      product.barcode = String(barcode).trim() || product.sku || product.barcode;
    }

    if (category !== undefined) {
      product.category = String(category).trim() || 'General';
    }

    if (buyPrice !== undefined) {
      product.buyPrice = Math.max(0, Number(buyPrice) || 0);
    }

    if (sellPrice !== undefined || price !== undefined) {
      product.sellPrice = Math.max(0, Number(sellPrice ?? price) || 0);
    }

    if (quantity !== undefined) {
      const nextQty = Number(quantity);
      if (Number.isNaN(nextQty) || nextQty < 0) {
        return res.status(400).json({ message: 'Valid non-negative quantity is required' });
      }
      product.quantity = nextQty;
    }

    if (openingStock !== undefined) {
      product.openingStock = Math.max(0, Number(openingStock) || 0);
    }

    if (minStockLevel !== undefined || minStock !== undefined) {
      product.minStockLevel = Math.max(0, Number(minStockLevel ?? minStock) || 0);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'SKU or Barcode already exists' });
    }
    res.status(400).json({ message: err.message });
  }
};

// ৪. স্টক ইন / আউট আপডেট করা
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount } = req.body;
    const qty = Number(amount);

    if (!qty || qty <= 0) {
      return res.status(400).json({ message: 'Valid positive amount is required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const movementType = String(type || '').toUpperCase();

    if (movementType === 'IN') {
      product.purchasedQty = (product.purchasedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
    } else if (movementType === 'OUT') {
      if ((product.quantity || 0) < qty) {
        return res.status(400).json({ message: 'Insufficient stock for Invoice Sell' });
      }
      product.soldQty = (product.soldQty || 0) + qty;
      product.quantity = (product.quantity || 0) - qty;
    } else if (movementType === 'RETURN') {
      product.returnedQty = (product.returnedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
    } else {
      return res.status(400).json({ message: 'Invalid stock movement type' });
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৫. প্রোডাক্ট ডিলিট করা
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৬. রিটার্নের জন্য আলাদা ডেডিকেটেড ফাংশন
const handleProductReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnType, amount, reason } = req.body;
    const qty = Number(amount);

    if (!qty || qty <= 0) {
      return res.status(400).json({ message: 'Valid return quantity is required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (returnType === 'PURCHASE_RETURN') {
      if ((product.quantity || 0) < qty) {
        return res.status(400).json({ message: 'Insufficient stock to return to supplier' });
      }
      product.returnedQty = (product.returnedQty || 0) - qty;
      product.quantity = (product.quantity || 0) - qty;
    } else {
      product.returnedQty = (product.returnedQty || 0) + qty;
      product.quantity = (product.quantity || 0) + qty;
    }

    await product.save();
    res.json({
      message: 'Product return recorded successfully',
      reason: reason || '',
      product
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  handleProductReturn
};