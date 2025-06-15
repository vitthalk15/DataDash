export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
  preferences?: {
    notifications: {
      emailNotifications: boolean;
      orderUpdates: boolean;
      marketingEmails: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  _id: string;
  user: string | IUser;
  products: Array<{
    product: string | IProduct;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
  preferences?: {
    notifications: {
      emailNotifications: boolean;
      orderUpdates: boolean;
      marketingEmails: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
} 