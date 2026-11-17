require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const connectDB = require('./Config/dbConnect');
const productRoutes = require('./Routes/productRoutes');

const app = express()
app.use(cors());
app.use(express.json());

// ডাটাবেস কানেকশন
connectDB();

// routes
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('Stock Inventory ERP Server Running....!')
})



const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Stock Inventory ERP Server app listening on port ${port}`)
})