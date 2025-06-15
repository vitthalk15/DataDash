import express, { Request, Response, NextFunction, Router } from 'express';
import { User, IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { auth, adminAuth } from '../middleware/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

// Extend Express Request type
interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId };
}

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

const router: Router = express.Router();

// Register user
router.post('/register', (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    User.findOne({ email }).then(existingUser => {
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({
        name,
        email,
        password,
        role: 'user'
      });

      user.save().then(() => {
        const token = jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET || 'your-super-secret-jwt-key',
          { expiresIn: '7d' }
        );

        return res.status(201).json({
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    User.findOne({ email }).then(user => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      user.comparePassword(password).then(isMatch => {
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET || 'your-super-secret-jwt-key',
          { expiresIn: '7d' }
        );

        return res.json({
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
router.get('/me', auth, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      company: user.company,
      position: user.position,
      bio: user.bio,
      timezone: user.timezone,
      language: user.language,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', auth, (req: Request, res: Response) => {
  try {
    User.find().select('-password').then(users => {
      return res.json({ users });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', auth, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.params.id;
    if (user.role !== 'admin' && user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    User.findById(userId).select('-password').then(foundUser => {
      if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(foundUser);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/:id', auth, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.params.id;
    if (user.role !== 'admin' && user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role;
    delete updateData.email;

    User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(updatedUser);
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const userId = req.params.id;
    if (user._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    User.findByIdAndDelete(userId).then(deletedUser => {
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ message: 'User deleted successfully' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 