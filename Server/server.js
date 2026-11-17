require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const connectDB = require('./Config/dbConnect');
const productRoutes = require('./Routes/productRoutes');
const supplierRoutes = require('./Routes/supplierRoutes'); 
const clientRoutes = require('./Routes/clientRoutes');
const purchaseRoutes = require('./Routes/purchaseRoutes');  
const invoiceRoutes = require('./Routes/invoiceRoutes'); 
const authRoutes = require('./Routes/authRoutes');  

const app = express()
app.use(cors());
app.use(express.json());

// ডাটাবেস কানেকশন
connectDB();

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