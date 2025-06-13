import express, { Request, Response, Router, NextFunction, RequestHandler } from 'express';
import { User, IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Types } from 'mongoose';

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

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

const router: Router = express.Router();

// Register user
const registerHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = new User({
      name,
      email,
      password,
      role: 'user'
    });

    await user.save();

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    next(error);
  }
};

// Login user
const loginHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    next(error);
  }
};

// Get user by email
const getUserByEmailHandler: RequestHandler = async (req, res, next) => {
  try {
    const email = z.string().email().parse(req.params.email);
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid email format', errors: error.errors });
      return;
    }
    next(error);
  }
};

// Get all users
const getAllUsersHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUserHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      preferences: user.preferences
    };
    res.json({ user: userResponse });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUserHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = new Types.ObjectId(id);
    const user = req.user;
    if (!user || !user._id || !userId.equals(user._id)) {
      res.status(403).json({ message: 'Not authorized to update this profile' });
      return;
    }
    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;
    if (req.file) {
      updateData.avatar = req.file.buffer.toString('base64');
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Update password
const updatePasswordHandler: AsyncRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = new Types.ObjectId(id);
    const user = req.user;
    if (!user || !user._id || !userId.equals(user._id)) {
      res.status(403).json({ message: 'Not authorized to update this profile' });
      return;
    }
    const validatedData = updatePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, userToUpdate.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }
    userToUpdate.password = newPassword;
    await userToUpdate.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    next(error);
  }
};

// Register routes
router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  registerHandler(req as AuthRequest, res, next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  loginHandler(req as AuthRequest, res, next);
});

router.get('/me', auth, (req: Request, res: Response, next: NextFunction) => {
  getCurrentUserHandler(req as AuthRequest, res, next);
});

router.get('/email/:email', auth, (req: Request, res: Response, next: NextFunction) => {
  getUserByEmailHandler(req as AuthRequest, res, next);
});

router.get('/', auth, (req: Request, res: Response, next: NextFunction) => {
  getAllUsersHandler(req as AuthRequest, res, next);
});

router.put('/:id', auth, upload.single('avatar'), (req: Request, res: Response, next: NextFunction) => {
  updateUserHandler(req as AuthRequest, res, next);
});

router.put('/:id/password', auth, (req: Request, res: Response, next: NextFunction) => {
  updatePasswordHandler(req as AuthRequest, res, next);
});

export default router; 