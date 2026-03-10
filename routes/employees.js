const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'panda_store_secret_2024';

// GET /employees - lấy tất cả nhân viên
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /employees/:id
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /employees - tạo nhân viên mới
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, position, department, salary } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password are required' });
    }
    const employee = new Employee({ name, email, password, phone, position, department, salary });
    const saved = await employee.save();
    const result = saved.toObject();
    delete result.password;
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /employees/login - đăng nhập nhân viên
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password are required' });
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = jwt.sign({ id: employee._id, role: 'employee', name: employee.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, message: 'Login successful', token, user: { _id: employee._id, name: employee.name, email: employee.email, role: 'employee' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /employees/:id - cập nhật nhân viên
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, position, department, salary } = req.body;
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, phone, position, department, salary },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /employees/:id - xóa nhân viên
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
