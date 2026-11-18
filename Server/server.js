require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');


const connectDB = require('./Config/dbConnect');
const productRoutes = require('./Routes/productRoutes');
const supplierRoutes = require('./Routes/supplierRoutes'); 
const clientRoutes = require('./Routes/clientRoutes');
const purchaseRoutes = require('./Routes/purchaseRoutes');  
const invoiceRoutes = require('./Routes/invoiceRoutes'); 
const authRoutes = require('./Routes/authRoutes');  

const app = express()
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ডাটাবেস কানেকশন
connectDB();

// ডিফল্ট অ্যাডমিন সিড করার ফাংশন
const seedAdmin = async () => {
  try {
    // চেক করা ডাটাবেজে কোনো অ্যাডমিন অ্যাকাউন্ট আছে কি না
    const adminExists = await User.findOne({ userType: 'admin' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt); // ডিফল্ট পাসওয়ার্ড

      await User.create({
        name: 'System Admin',
        email: 'admin@example.com', // ডিফল্ট ইমেইল
        password: hashedPassword,
        userType: 'admin',
        role: 'Admin',
        permissions: {
          products: true,
          suppliers: true,
          clients: true,
          purchases: true,
          invoices: true,
          users: true // সব পারমিশন বাই ডিফল্ট ট্রু থাকবে
        }
      });

      console.log('✅ Default Admin account created successfully! Email: admin@example.com | Password: admin123');
    }
  } catch (err) {
    console.error('❌ Error seeding admin user:', err.message);
  }
};

// Call the seedAdmin function when the server starts
seedAdmin();

// API Endpoints
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Stock Inventory ERP Server Running....!')
})



const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Stock Inventory ERP Server app listening on port ${port}`)
})