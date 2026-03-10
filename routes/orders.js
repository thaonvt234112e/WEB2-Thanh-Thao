const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Customer = require('../models/Customer');

// GET /orders - lấy tất cả đơn hàng
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.customerId) query.customerId = req.query.customerId;
    if (req.query.status) query.status = req.query.status;

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .sort({ orderDate: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /orders/revenue - thống kê doanh thu (chỉ đơn paid)
// Query: ?year=2024&month=1&categoryId=
router.get('/revenue', async (req, res) => {
  try {
    const matchStage = { status: 'paid' };

    // Lọc theo năm và tháng
    if (req.query.year) {
      const year = parseInt(req.query.year);
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);
      matchStage.orderDate = { $gte: start, $lt: end };
    }

    // Lấy tất cả paid orders trong khoảng thời gian
    const paidOrders = await Order.find(matchStage);
    const orderIds = paidOrders.map(o => o._id);

    // Aggregate doanh thu theo tháng
    const revenueByMonth = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $count: {} }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Doanh thu theo category (join qua OrderDetail -> Product -> Category)
    const revenueByCategory = await OrderDetail.aggregate([
      { $match: { orderId: { $in: orderIds } } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          totalRevenue: { $sum: '$subtotal' },
          itemsSold: { $sum: '$quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: paidOrders.length,
        revenueByMonth,
        revenueByCategory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /orders/:id - lấy chi tiết 1 đơn hàng
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const details = await OrderDetail.find({ orderId: req.params.id }).populate('productId', 'name price imageUrl');
    res.json({ success: true, data: { ...order.toObject(), details } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /orders - tạo đơn hàng mới
router.post('/', async (req, res) => {
  try {
    const { customerId, note, items } = req.body;
    if (!customerId) return res.status(400).json({ success: false, message: 'customerId is required' });

    const order = new Order({ customerId, note, status: 'pending', totalAmount: 0 });
    const savedOrder = await order.save();

    // Nếu có items, tạo OrderDetail
    let total = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        const detail = new OrderDetail({
          orderId: savedOrder._id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });
        await detail.save();
        total += detail.subtotal;
      }
      savedOrder.totalAmount = total;
      await savedOrder.save();
    }

    res.status(201).json({ success: true, data: savedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /orders/:id - cập nhật đơn hàng (status, note, totalAmount)
router.put('/:id', async (req, res) => {
  try {
    const { status, note, totalAmount } = req.body;
    const updateData = { status, note, totalAmount };

    // Nếu đổi status sang paid => ghi paidDate
    if (status === 'paid') updateData.paidDate = new Date();

    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });

    // Nếu paid, cập nhật totalPurchase của customer
    if (status === 'paid') {
      await Customer.findByIdAndUpdate(updated.customerId, { $inc: { totalPurchase: updated.totalAmount } });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /orders/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
    // Xóa luôn các OrderDetail liên quan
    await OrderDetail.deleteMany({ orderId: req.params.id });
    res.json({ success: true, message: 'Order and its details deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
