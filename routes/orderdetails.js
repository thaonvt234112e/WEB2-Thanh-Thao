const express = require('express');
const router = express.Router();
const OrderDetail = require('../models/OrderDetail');
const Order = require('../models/Order');

// GET /orderdetails - theo orderId
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.orderId) query.orderId = req.query.orderId;
    const details = await OrderDetail.find(query)
      .populate('productId', 'name price imageUrl')
      .populate('orderId', 'status orderDate');
    res.json({ success: true, data: details });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /orderdetails/:id - lấy 1 chi tiết
router.get('/:id', async (req, res) => {
  try {
    const detail = await OrderDetail.findById(req.params.id)
      .populate('productId', 'name price imageUrl')
      .populate('orderId', 'status customerId');
    if (!detail) return res.status(404).json({ success: false, message: 'OrderDetail not found' });
    res.json({ success: true, data: detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /orderdetails - thêm sản phẩm vào đơn hàng
router.post('/', async (req, res) => {
  try {
    const { orderId, productId, quantity, unitPrice } = req.body;
    if (!orderId || !productId || !quantity || !unitPrice) {
      return res.status(400).json({ success: false, message: 'orderId, productId, quantity, unitPrice are required' });
    }
    const detail = new OrderDetail({ orderId, productId, quantity, unitPrice });
    const saved = await detail.save();

    // Cập nhật totalAmount của Order
    const allDetails = await OrderDetail.find({ orderId });
    const total = allDetails.reduce((sum, d) => sum + d.subtotal, 0);
    await Order.findByIdAndUpdate(orderId, { totalAmount: total });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /orderdetails/:id - cập nhật số lượng
router.put('/:id', async (req, res) => {
  try {
    const { quantity, unitPrice } = req.body;
    const detail = await OrderDetail.findById(req.params.id);
    if (!detail) return res.status(404).json({ success: false, message: 'OrderDetail not found' });
    if (quantity !== undefined) detail.quantity = quantity;
    if (unitPrice !== undefined) detail.unitPrice = unitPrice;
    await detail.save(); // Trigger pre-save subtotal calculation

    // Cập nhật totalAmount của Order
    const allDetails = await OrderDetail.find({ orderId: detail.orderId });
    const total = allDetails.reduce((sum, d) => sum + d.subtotal, 0);
    await Order.findByIdAndUpdate(detail.orderId, { totalAmount: total });

    res.json({ success: true, data: detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /orderdetails/:id - xóa 1 dòng chi tiết
router.delete('/:id', async (req, res) => {
  try {
    const detail = await OrderDetail.findByIdAndDelete(req.params.id);
    if (!detail) return res.status(404).json({ success: false, message: 'OrderDetail not found' });

    // Cập nhật lại totalAmount
    const allDetails = await OrderDetail.find({ orderId: detail.orderId });
    const total = allDetails.reduce((sum, d) => sum + d.subtotal, 0);
    await Order.findByIdAndUpdate(detail.orderId, { totalAmount: total });

    res.json({ success: true, message: 'OrderDetail deleted', data: detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
