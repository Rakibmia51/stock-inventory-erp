const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_erp_secret_key';

// // টোকেন চেক করে ইউজারকে রিকোয়েস্টে যুক্ত করা
// const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, JWT_SECRET);
//       req.user = await User.findById(decoded.id).select('-password');
//       next();
//     } catch (err) {
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// // শুধুমাত্র Admin-দের জন্য রাউট প্রটেক্ট করা
// const adminOnly = (req, res, next) => {
//   if (req.user && (req.user.userType === 'admin' || req.user.role === 'Admin')) {
//     next();
//   } else {
//     res.status(403).json({ message: 'Access denied. Admins only!' });
//   }
// };


// ১. টোকেন ভেরিফাই করে ইউজার লোড করা
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ২. শুধুমাত্র Admin-দের জন্য রাউট প্রটেক্ট করা
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.userType === 'admin' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only!' });
  }
};

// ৩. ডাইনামিক মডিউল পারমিশন মিডেলওয়্যার (Reusable)
const checkPermission = (moduleName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // অ্যাডমিন সব মডিউলের অ্যাক্সেস পাবে
    if (req.user.userType === 'admin' || req.user.role === 'Admin') {
      return next();
    }

    // ইউজারের নির্দিষ্ট মডিউল পারমিশন চেক করা
    if (req.user.permissions && req.user.permissions[moduleName] === true) {
      return next();
    }

    return res.status(403).json({ 
      message: `Access denied! You do not have permission for the '${moduleName}' module.` 
    });
  };
};


// Admin অথবা 'users' পারমিশনপ্রাপ্ত ইউজারদের জন্য মিডেলওয়্যার
const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const userType = (req.user.userType || '').toLowerCase();
  const userRole = (req.user.role || '').toLowerCase();
  const isAdmin = userType === 'admin' || userRole === 'admin';

  // ইউজার যদি Admin হয় অথবা তাকে 'users' মডিউলের পারমিশন দেওয়া হয়ে থাকে
  if (isAdmin || req.user.permissions?.users === true) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied! You do not have permission to manage users.' });
};


module.exports = { protect, adminOnly, checkPermission, canManageUsers};