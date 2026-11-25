const Setting = require('../Models/Setting');

const SETTINGS_KEY = 'GLOBAL_ERP_SETTINGS';

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    let doc = await Setting.findOne({ key: SETTINGS_KEY }).lean();

    if (!doc) {
      doc = await Setting.findOne().sort({ updatedAt: -1 }).lean();
    }

    if (!doc) {
      const created = await Setting.create({ key: SETTINGS_KEY });
      doc = created.toObject();
    }

    return res.status(200).json(doc);
  } catch (err) {
    console.error('GET /api/settings error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      'companyName',
      'logoUrl',
      'tagline',
      'phone',
      'email',
      'address',
      'taxId',
      'currencySymbol',
      'invoicePrefix',
      'invoiceFooter',
      'defaultMinStock',
      'defaultPaymentMethod',
      'defaultMobileProvider',
      'showSignatureOnPrint',
      'autoReloadAfterAction'
    ];

    const updates = { key: SETTINGS_KEY };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await Setting.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: updates },
      { new: true, upsert: true, runValidators: true, lean: true }
    );

    return res.status(200).json(updated);
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    return res.status(400).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings };