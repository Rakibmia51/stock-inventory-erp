const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_erp_secret_key';


// অ্যাডমিন কর্তৃক নতুন ইউজার তৈরি
const createUser = async (req, res) => {
  try {
    const { name, email, password, userType, permissions } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      userType: userType || 'staff',
      role: userType === 'admin' ? 'Admin' : 'Staff',
      permissions: permissions || {
        products: false,
        suppliers: false,
        clients: false,
        purchases: false,
        invoices: false,
        accounts: false,
        reports: false,
        users: false
      }
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
      permissions: newUser.permissions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ১. রেজিস্টার (প্রথমবার অ্যাডমিন বা নতুন ইউজার তৈরি)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, userType } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // role ('Admin') অথবা userType ('admin') যেকোনোটি পাঠালেই অ্যাডমিন হিসেবে সেট হবে
    const resolvedType = (userType || role || 'staff').toLowerCase();
    const isAdmin = resolvedType === 'admin';

    const defaultPermissions = {
      products: isAdmin,
      suppliers: isAdmin,
      clients: isAdmin,
      purchases: isAdmin,
      invoices: isAdmin,
      accounts: isAdmin,
      reports: isAdmin,
    };

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType: resolvedType,
      permissions: defaultPermissions
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      permissions: user.permissions,
      token: jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '30d' })
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. লগইন
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // পুরনো ডাটাবেস ডকুমেন্টের ক্ষেত্রেও যেন userType এবং permissions ঠিক থাকে
      const resolvedType = (user.userType || user.role || 'staff').toLowerCase();
      const isAdmin = resolvedType === 'admin';

      const userPermissions = user.permissions || {
        products: isAdmin,
        suppliers: isAdmin,
        clients: isAdmin,
        purchases: isAdmin,
        invoices: isAdmin,
        accounts: isAdmin,
        reports: isAdmin,
        users: isAdmin
      };

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: resolvedType,
        permissions: userPermissions,
        token: jwt.sign({ id: user._id, userType: resolvedType }, JWT_SECRET, { expiresIn: '30d' })
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৩. সব ইউজার লিস্ট দেখা (শুধুমাত্র অ্যাডমিন)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৪. ইউজারের পারমিশন ও ইউজার টাইপ আপডেট করা (শুধুমাত্র অ্যাডমিন)
const updateUserPermissions = async (req, res) => {
  try {
    const { userId, userType, permissions } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userType, permissions },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {createUser, registerUser, loginUser, getAllUsers, updateUserPermissions };