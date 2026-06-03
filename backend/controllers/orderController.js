import { getDbMode } from '../utils/db.js';
import { jsonDb } from '../utils/dbStore.js';
import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    deliveryFee,
    totalPrice
  } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const orderData = {
      user: req.user._id || req.user.id,
      orderItems: orderItems.map(item => ({
        name: item.name,
        qty: Number(item.qty),
        image: item.image,
        price: Number(item.price),
        foodItem: item._id || item.id
      })),
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Paid', // Mock paid automatically
      deliveryFee: Number(deliveryFee),
      tax: Number(taxPrice),
      totalPrice: Number(totalPrice),
      status: 'Placed'
    };

    let createdOrder;
    if (getDbMode()) {
      createdOrder = jsonDb.create('orders', orderData);
    } else {
      createdOrder = await Order.create(orderData);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  const { id } = req.params;

  try {
    let order;
    if (getDbMode()) {
      order = jsonDb.findById('orders', id);
      if (order) {
        // Mock populating user name & email for fallback
        const user = jsonDb.findById('users', order.user);
        order.user = user ? { name: user.name, email: user.email } : { name: 'Guest', email: 'guest@example.com' };
      }
    } else {
      order = await Order.findById(id).populate('user', 'name email');
    }

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  const userId = req.user._id || req.user.id;

  try {
    let orders;
    if (getDbMode()) {
      orders = jsonDb.find('orders', { user: userId });
      // Sort desc by date
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    let orders;
    if (getDbMode()) {
      orders = jsonDb.find('orders');
      orders.forEach(order => {
        const user = jsonDb.findById('users', order.user);
        order.user = user ? { _id: user._id, name: user.name } : { name: 'Guest' };
      });
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    let order;
    if (getDbMode()) {
      order = jsonDb.findById('orders', id);
    } else {
      order = await Order.findById(id);
    }

    if (order) {
      const updatedFields = { status };
      let updatedOrder;

      if (getDbMode()) {
        updatedOrder = jsonDb.findByIdAndUpdate('orders', id, updatedFields);
        const user = jsonDb.findById('users', updatedOrder.user);
        updatedOrder.user = user ? { name: user.name, email: user.email } : { name: 'Guest' };
      } else {
        order.status = status;
        updatedOrder = await order.save();
        updatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');
      }

      // Emit Socket.io updates
      const io = req.app.get('socketio');
      if (io) {
        io.to(id).emit('orderStatusUpdated', updatedOrder);
        io.emit('globalOrderStatusUpdate', { 
          orderId: id, 
          userId: updatedOrder.user?._id || updatedOrder.user?.id || updatedOrder.user,
          status: updatedOrder.status 
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Advance order status simulation
// @route   POST /api/orders/:id/advance
// @access  Private
export const advanceOrderStatus = async (req, res, next) => {
  const { id } = req.params;

  try {
    let order;
    if (getDbMode()) {
      order = jsonDb.findById('orders', id);
    } else {
      order = await Order.findById(id);
    }

    if (order) {
      const statusCycle = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
      const currentIndex = statusCycle.indexOf(order.status);
      const nextIndex = (currentIndex + 1) % statusCycle.length;
      const newStatus = statusCycle[nextIndex];

      let updatedOrder;
      if (getDbMode()) {
        updatedOrder = jsonDb.findByIdAndUpdate('orders', id, { status: newStatus });
        const user = jsonDb.findById('users', updatedOrder.user);
        updatedOrder.user = user ? { name: user.name, email: user.email } : { name: 'Guest' };
      } else {
        order.status = newStatus;
        updatedOrder = await order.save();
        updatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');
      }

      // Emit Socket.io updates
      const io = req.app.get('socketio');
      if (io) {
        io.to(id).emit('orderStatusUpdated', updatedOrder);
        io.emit('globalOrderStatusUpdate', { 
          orderId: id, 
          userId: updatedOrder.user?._id || updatedOrder.user?.id || updatedOrder.user,
          status: updatedOrder.status 
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};
