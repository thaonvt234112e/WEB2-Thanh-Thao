const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'panda_store_secret_2024';

// GET /customers - lấy tất cả khách hàng
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ totalPurchase: -1 });
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /customers/vip?limit=5 - lấy N khách VIP (tổng mua hàng cao nhất)
router.get('/vip', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const vips = await Customer.find().select('-password').sort({ totalPurchase: -1 }).limit(limit);
    res.json({ success: true, data: vips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /customers - đăng ký khách hàng mới
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password are required' });
    }
    const customer = new Customer({ name, email, password, phone, address });
    const saved = await customer.save();
    const result = saved.toObject();
    delete result.password;
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /customers/login - đăng nhập khách hàng
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password are required' });
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = jwt.sign({ id: customer._id, role: 'customer', name: customer.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, message: 'Login successful', token, user: { _id: customer._id, name: customer.name, email: customer.email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /customers/:id - cập nhật thông tin
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /customers/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
