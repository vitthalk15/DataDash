import express, { Request, Response, Router, NextFunction, RequestHandler } from 'express';
import mongoose, { Types } from 'mongoose';
import { Order, IOrder } from '../models/Order';
import { auth } from '../middleware/auth';
import { IUser } from '../models/User';
import { z } from 'zod';

// Extend Express Request type
interface AuthRequest extends Request {
  user: IUser & { _id: Types.ObjectId };
}

// Custom type for async request handlers
type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

const router: Router = express.Router();

// Get all orders
const getAllOrdersHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query: any = {};

    // If not admin, only show user's orders
    if (user.role !== 'admin') {
      query.user = new Types.ObjectId(user._id.toString());
    }

    if (search) {
      // Search in shipping address fields
      query.$or = [
        { 'shippingAddress.street': { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } },
        { 'shippingAddress.state': { $regex: search, $options: 'i' } },
        { 'shippingAddress.country': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    // Debug logging
    console.log('ORDERS ROUTE DEBUG');
    console.log('User:', user.email, 'Role:', user.role, 'UserID:', user._id.toString());
    console.log('Query:', JSON.stringify(query));

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));

    const orders = await Order.find(query)
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('products.product');

    console.log('Orders found:', orders.length);

    res.json({
      orders,
      total,
      totalPages,
      currentPage: Number(page)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    console.error('ORDERS ROUTE ERROR:', error);
    next(error);
  }
};

// Get user's orders
const getMyOrdersHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const orders = await Order.find({ user: new Types.ObjectId(user._id.toString()) })
      .populate('products.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Create new order
const createOrderHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { products, shippingAddress } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ message: 'Products are required' });
      return;
    }

    if (!shippingAddress) {
      res.status(400).json({ message: 'Shipping address is required' });
      return;
    }

    // Fetch product prices from DB
    const productIds = products.map((p: any) => p.product);
    const dbProducts = await mongoose.model('Product').find({ _id: { $in: productIds } });
    const priceMap = new Map(dbProducts.map((p: any) => [p._id.toString(), p.price]));
    let totalAmount = 0;
    for (const item of products) {
      const price = priceMap.get(item.product.toString());
      if (!price) {
        res.status(400).json({ message: `Product not found: ${item.product}` });
        return;
      }
      totalAmount += price * item.quantity;
    }

    const order = new Order({
      user: user._id,
      products,
      shippingAddress,
      status: 'pending',
      totalAmount
    });

    await order.save();
    await order.populate('products.product');

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    next(error);
  }
};

// Get order by ID
const getOrderByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const order = await Order.findById(id).populate('products.product');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (user.role !== 'admin' && !order.user.equals(user._id)) {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Update order
const updateOrderHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (user.role !== 'admin' && !order.user.equals(user._id)) {
      res.status(403).json({ message: 'Not authorized to update this order' });
      return;
    }

    const updateData = { ...req.body };
    delete updateData.status; // Status can only be updated by admin
    delete updateData.user; // User cannot be changed

    // If products are being updated, recalculate totalAmount
    if (updateData.products && Array.isArray(updateData.products)) {
      const productIds = updateData.products.map((p: any) => p.product);
      const dbProducts = await mongoose.model('Product').find({ _id: { $in: productIds } });
      const priceMap = new Map(dbProducts.map((p: any) => [p._id.toString(), p.price]));
      let totalAmount = 0;
      for (const item of updateData.products) {
        const price = priceMap.get(item.product.toString());
        if (!price) {
          res.status(400).json({ message: `Product not found: ${item.product}` });
          return;
        }
        totalAmount += price * item.quantity;
      }
      updateData.totalAmount = totalAmount;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('products.product');

    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    next(error);
  }
};

// Update order status (admin only)
const updateOrderStatusHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update order status' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('products.product');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    next(error);
  }
};

// Register routes
router.get('/', auth, getAllOrdersHandler);
router.get('/my-orders', auth, getMyOrdersHandler);
router.post('/', auth, createOrderHandler);
router.get('/:id', auth, getOrderByIdHandler);
router.put('/:id', auth, updateOrderHandler);
router.patch('/:id/status', auth, updateOrderStatusHandler);

// Delete order
router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (user.role !== 'admin' && !order.user.equals(user._id)) {
      res.status(403).json({ message: 'Not authorized to delete this order' });
      return;
    }

    await Order.findByIdAndDelete(id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    next(error);
  }
});

export default router; 