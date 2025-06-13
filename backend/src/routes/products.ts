import express, { Request, Response, Router, NextFunction } from 'express';
import { Product, IProduct } from '../models/Product';
import { auth } from '../middleware/auth';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

// Extend Express Request type
interface AuthRequest extends Request {
  user: IUser & { _id: mongoose.Types.ObjectId };
}

// Type for request handlers
type AsyncRequestHandler = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

const router: Router = express.Router();

// Get all products with filtering and pagination
router.get('/', (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add search filter if provided
    if (search) {
      query.$text = { $search: search as string };
    }

    // Calculate skip value for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and sorting
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
}) as AsyncRequestHandler);

// Get single product
router.get('/:id', (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}) as AsyncRequestHandler);

// Create product (admin only)
router.post('/', auth, (async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const { name, description, price, category, stock, image, sku, brand } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || stock === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Check if SKU is unique if provided
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        res.status(400).json({ message: 'SKU already exists' });
        return;
      }
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      image,
      sku,
      brand,
      status: 'active'
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}) as AsyncRequestHandler);

// Update product (admin only)
router.put('/:id', auth, (async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const { name, description, price, category, stock, image, sku, brand, status } = req.body;
    const updateData: any = {};

    // Only update fields that are provided
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (image) updateData.image = image;
    if (brand) updateData.brand = brand;
    if (status) updateData.status = status;

    // Check SKU uniqueness if being updated
    if (sku) {
      const existingProduct = await Product.findOne({ sku, _id: { $ne: req.params.id } });
      if (existingProduct) {
        res.status(400).json({ message: 'SKU already exists' });
        return;
      }
      updateData.sku = sku;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}) as AsyncRequestHandler);

// Delete product (admin only)
router.delete('/:id', auth, (async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}) as AsyncRequestHandler);

export default router; 