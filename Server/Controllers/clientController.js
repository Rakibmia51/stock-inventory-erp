const Client = require('../Models/Client');

// সব ক্লায়েন্ট দেখা
const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// নতুন ক্লায়েন্ট যোগ করা
const createClient = async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ক্লায়েন্ট ডিলিট করা
const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getClients, createClient, deleteClient };