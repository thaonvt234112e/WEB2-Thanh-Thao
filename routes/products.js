const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /products - lấy tất cả, hỗ trợ filter và sort
// Query: ?price_min=&price_max=&model=&madeBy=&categoryId=&sort=price_asc|price_desc
router.get('/', async (req, res) => {
  try {
    const query = {};

    // Filter theo price (range)
    if (req.query.price_min || req.query.price_max) {
      query.price = {};
      if (req.query.price_min) query.price.$gte = Number(req.query.price_min);
      if (req.query.price_max) query.price.$lte = Number(req.query.price_max);
    }

    // Filter theo model (search)
    if (req.query.model) {
      query.model = { $regex: new RegExp(req.query.model, 'i') };
    }

    // Filter theo madeBy (hãng sản xuất)
    if (req.query.madeBy) {
      query.madeBy = { $regex: new RegExp(req.query.madeBy, 'i') };
    }

    // Filter theo categoryId
    if (req.query.categoryId) {
      query.categoryId = req.query.categoryId;
    }

    // Search by name
    if (req.query.name) {
      query.name = { $regex: new RegExp(req.query.name, 'i') };
    }

    // Sort theo price
    let sortOption = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sortOption = { price: 1 };
    if (req.query.sort === 'price_desc') sortOption = { price: -1 };

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort(sortOption);

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /products/:id - lấy 1 sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /products - tạo sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const { name, model, madeBy, price, stock, description, imageUrl, categoryId } = req.body;
    if (!name || !model || !madeBy || price === undefined || !categoryId) {
      return res.status(400).json({ success: false, message: 'name, model, madeBy, price, categoryId are required' });
    }
    const product = new Product({ name, model, madeBy, price, stock, description, imageUrl, categoryId });
    const saved = await product.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /products/:id - cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const { name, model, madeBy, price, stock, description, imageUrl, categoryId } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, model, madeBy, price, stock, description, imageUrl, categoryId },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /products/:id - xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
