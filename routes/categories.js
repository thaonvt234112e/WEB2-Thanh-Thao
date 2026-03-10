const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /categories - lấy tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /categories/:id - lấy 1 danh mục
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /categories - tạo mới danh mục
router.post('/', async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });
    const category = new Category({ name, description, imageUrl });
    const saved = await category.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Category name already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /categories/:id - cập nhật danh mục
router.put('/:id', async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, imageUrl },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /categories/:id - xóa danh mục
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
