import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  address?: string;
  avatar?: string;
  company?: string;
  position?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      emailNotifications: boolean;
      orderUpdates: boolean;
      marketingEmails: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: { type: String },
  address: { type: String },
  avatar: { type: String },
  company: { type: String },
  position: { type: String },
  bio: { type: String },
  timezone: { type: String },
  language: { type: String, default: 'en' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      securityAlerts: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 