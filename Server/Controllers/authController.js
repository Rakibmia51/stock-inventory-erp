// const User = require('../Models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'nexus_erp_secret_key';


// // অ্যাডমিন কর্তৃক নতুন ইউজার তৈরি
// const createUser = async (req, res) => {
//   try {
//     const { name, email, password, userType, permissions } = req.body;
    
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists with this email' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       userType: userType || 'staff',
//       role: userType === 'admin' ? 'Admin' : 'Staff',
//       permissions: permissions || {
//         products: false,
//         suppliers: false,
//         clients: false,
//         purchases: false,
//         invoices: false,
//         accounts: false,
//         reports: false,
//         users: false
//       }
//     });

//     res.status(201).json({
//       _id: newUser._id,
//       name: newUser.name,
//       email: newUser.email,
//       userType: newUser.userType,
//       permissions: newUser.permissions
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ১. রেজিস্টার (প্রথমবার অ্যাডমিন বা নতুন ইউজার তৈরি)
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role, userType } = req.body;
    
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // role ('Admin') অথবা userType ('admin') যেকোনোটি পাঠালেই অ্যাডমিন হিসেবে সেট হবে
//     const resolvedType = (userType || role || 'staff').toLowerCase();
//     const isAdmin = resolvedType === 'admin';

//     const defaultPermissions = {
//       products: isAdmin,
//       suppliers: isAdmin,
//       clients: isAdmin,
//       purchases: isAdmin,
//       invoices: isAdmin,
//       accounts: isAdmin,
//       reports: isAdmin,
//     };

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       userType: resolvedType,
//       permissions: defaultPermissions
//     });

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       userType: user.userType,
//       permissions: user.permissions,
//       token: jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '30d' })
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ২. লগইন
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (user && (await bcrypt.compare(password, user.password))) {
//       // পুরনো ডাটাবেস ডকুমেন্টের ক্ষেত্রেও যেন userType এবং permissions ঠিক থাকে
//       const resolvedType = (user.userType || user.role || 'staff').toLowerCase();
//       const isAdmin = resolvedType === 'admin';

//       const userPermissions = user.permissions || {
//         products: isAdmin,
//         suppliers: isAdmin,
//         clients: isAdmin,
//         purchases: isAdmin,
//         invoices: isAdmin,
//         accounts: isAdmin,
//         reports: isAdmin,
//         users: isAdmin
//       };

//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         userType: resolvedType,
//         permissions: userPermissions,
//         token: jwt.sign({ id: user._id, userType: resolvedType }, JWT_SECRET, { expiresIn: '30d' })
//       });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ৩. সব ইউজার লিস্ট দেখা (শুধুমাত্র অ্যাডমিন)
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ৪. ইউজারের পারমিশন ও ইউজার টাইপ আপডেট করা (শুধুমাত্র অ্যাডমিন)
// const updateUserPermissions = async (req, res) => {
//   try {
//     const { userId, userType, permissions } = req.body;
    
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { userType, permissions },
//       { new: true }
//     ).select('-password');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = {createUser, registerUser, loginUser, getAllUsers, updateUserPermissions };



// const User = require('../Models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'nexus_erp_secret_key';

// const buildDefaultPermissions = (isAdmin) => ({
//   products: Boolean(isAdmin),
//   suppliers: Boolean(isAdmin),
//   clients: Boolean(isAdmin),
//   purchases: Boolean(isAdmin),
//   invoices: Boolean(isAdmin),
//   accounts: Boolean(isAdmin),
//   reports: Boolean(isAdmin),
//   users: Boolean(isAdmin)
// });

// // অ্যাডমিন কর্তৃক নতুন ইউজার তৈরি
// const createUser = async (req, res) => {
//   try {
//     const { name, email, password, userType, permissions } = req.body;
//     const normalizedEmail = String(email || '').trim().toLowerCase();

//     const userExists = await User.findOne({ email: normalizedEmail });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists with this email' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const resolvedType = String(userType || 'staff').toLowerCase();
//     const isAdmin = resolvedType === 'admin';

//     const newUser = await User.create({
//       name: String(name || '').trim(),
//       email: normalizedEmail,
//       password: hashedPassword,
//       userType: resolvedType,
//       role: isAdmin ? 'Admin' : resolvedType === 'others' ? 'Others' : 'Staff',
//       permissions: {
//         ...buildDefaultPermissions(false),
//         ...(permissions || {})
//       }
//     });

//     res.status(201).json({
//       _id: newUser._id,
//       name: newUser.name,
//       email: newUser.email,
//       userType: newUser.userType,
//       role: newUser.role,
//       permissions: newUser.permissions
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ১. রেজিস্টার (প্রথমবার অ্যাডমিন বা নতুন ইউজার তৈরি)
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role, userType } = req.body;
//     const normalizedEmail = String(email || '').trim().toLowerCase();

//     const userExists = await User.findOne({ email: normalizedEmail });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const resolvedType = String(userType || role || 'staff').toLowerCase();
//     const isAdmin = resolvedType === 'admin';

//     const user = await User.create({
//       name: String(name || '').trim(),
//       email: normalizedEmail,
//       password: hashedPassword,
//       userType: resolvedType,
//       role: isAdmin ? 'Admin' : resolvedType === 'others' ? 'Others' : 'Staff',
//       permissions: buildDefaultPermissions(isAdmin)
//     });

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       userType: user.userType,
//       role: user.role,
//       permissions: user.permissions,
//       token: jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '30d' })
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ২. লগইন
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const normalizedEmail = String(email || '').trim().toLowerCase();
//     const user = await User.findOne({ email: normalizedEmail });

//     if (user && (await bcrypt.compare(password, user.password))) {
//       const resolvedType = String(user.userType || user.role || 'staff').toLowerCase();
//       const isAdmin = resolvedType === 'admin';

//       const userPermissions = {
//         ...buildDefaultPermissions(isAdmin),
//         ...(user.permissions || {})
//       };

//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         userType: resolvedType,
//         role: user.role || (isAdmin ? 'Admin' : 'Staff'),
//         permissions: userPermissions,
//         token: jwt.sign({ id: user._id, userType: resolvedType }, JWT_SECRET, { expiresIn: '30d' })
//       });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ৩. সব ইউজার লিস্ট দেখা
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select('-password').sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ৪. ইউজারের পারমিশন ও ইউজার টাইপ আপডেট করা
// const updateUserPermissions = async (req, res) => {
//   try {
//     const { userId, userType, permissions } = req.body;
//     const resolvedType = String(userType || 'staff').toLowerCase();
//     const roleLabel =
//       resolvedType === 'admin' ? 'Admin' : resolvedType === 'others' ? 'Others' : 'Staff';

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         userType: resolvedType,
//         role: roleLabel,
//         permissions: {
//           ...buildDefaultPermissions(false),
//           ...(permissions || {})
//         }
//       },
//       { new: true }
//     ).select('-password');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ৫. ইউজার ডিলিট করা
// const deleteUser = async (req, res) => {
//   try {
//     const targetId = req.params?.id || req.body?.userId;
//     if (!targetId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }

//     if (req.user && String(req.user._id || req.user.id) === String(targetId)) {
//       return res.status(400).json({ message: 'You cannot delete your own active account' });
//     }

//     const deletedUser = await User.findByIdAndDelete(targetId).select('-password');
//     if (!deletedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({
//       message: 'User deleted successfully',
//       deletedUserId: deletedUser._id
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = {
//   createUser,
//   registerUser,
//   loginUser,
//   getAllUsers,
//   updateUserPermissions,
//   deleteUser
// };



const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_erp_secret_key';

const buildDefaultPermissions = (isAdmin) => ({
  products: Boolean(isAdmin),
  suppliers: Boolean(isAdmin),
  clients: Boolean(isAdmin),
  purchases: Boolean(isAdmin),
  invoices: Boolean(isAdmin),
  accounts: Boolean(isAdmin),
  reports: Boolean(isAdmin),
  users: Boolean(isAdmin)
});

// অ্যাডমিন কর্তৃক নতুন ইউজার তৈরি
const createUser = async (req, res) => {
  try {
    const { name, email, password, userType, permissions } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const resolvedType = String(userType || 'staff').toLowerCase();
    const isAdmin = resolvedType === 'admin';

    const newUser = await User.create({
      name: String(name || '').trim(),
      email: normalizedEmail,
      password: hashedPassword,
      userType: resolvedType,
      role: isAdmin ? 'Admin' : resolvedType === 'others' ? 'Others' : 'Staff',
      permissions: {
        ...buildDefaultPermissions(false),
        ...(permissions || {})
      }
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
      role: newUser.role,
      permissions: newUser.permissions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ১. রেজিস্টার
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, userType } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const resolvedType = String(userType || role || 'staff').toLowerCase();
    const isAdmin = resolvedType === 'admin';

    const user = await User.create({
      name: String(name || '').trim(),
      email: normalizedEmail,
      password: hashedPassword,
      userType: resolvedType,
      role: isAdmin ? 'Admin' : resolvedType === 'others' ? 'Others' : 'Staff',
      permissions: buildDefaultPermissions(isAdmin)
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      role: user.role,
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
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      const resolvedType = String(user.userType || user.role || 'staff').toLowerCase();
      const isAdmin = resolvedType === 'admin';

      const userPermissions = {
        ...buildDefaultPermissions(isAdmin),
        ...(user.permissions || {})
      };

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: resolvedType,
        role: user.role || (isAdmin ? 'Admin' : 'Staff'),
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

// ৩. সব ইউজার লিস্ট দেখা
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৪. ইউজারের পারমিশন ও ইউজার টাইপ আপডেট করা
const updateUserPermissions = async (req, res) => {
  try {
    const { userId, userType, permissions } = req.body;
    const resolvedType = String(userType || 'staff').toLowerCase();
    const roleLabel =
      resolvedType === 'admin' ? 'Admin' : resolvedType === 'others' ? 'Others' : 'Staff';

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        userType: resolvedType,
        role: roleLabel,
        permissions: {
          ...buildDefaultPermissions(false),
          ...(permissions || {})
        }
      },
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

// ৫. ইউজার ডিলিট করা
const deleteUser = async (req, res) => {
  try {
    const targetId = req.params?.id || req.body?.userId;
    if (!targetId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (req.user && String(req.user._id || req.user.id) === String(targetId)) {
      return res.status(400).json({ message: 'You cannot delete your own active account' });
    }

    const deletedUser = await User.findByIdAndDelete(targetId).select('-password');
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      deletedUserId: deletedUser._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৬. ইউজার নিজের পাসওয়ার্ড পরিবর্তন করবে (Current Password যাচাইসহ)
const changeOwnPassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const targetUserId = req.user?._id || req.user?.id || userId;

    if (!targetUserId) {
      return res.status(400).json({ message: 'User identification is missing' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৭. অ্যাডমিন কর্তৃক যেকোনো ইউজারের পাসওয়ার্ড পরিবর্তন/রিসেট
const adminResetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: `Password updated successfully for ${user.name}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createUser,
  registerUser,
  loginUser,
  getAllUsers,
  updateUserPermissions,
  deleteUser,
  changeOwnPassword,
  adminResetUserPassword
};