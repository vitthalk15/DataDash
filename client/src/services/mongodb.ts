import { IUser, IProduct, IOrder } from "@/types/models";

class MongoService {
  private API_URL: string;

  constructor() {
    // Use environment variable for API URL, fallback to relative path for development
    this.API_URL = import.meta.env.VITE_API_URL || '/api';
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
}

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        // Return empty array for GET requests that require admin privileges
        if (options.method === undefined || options.method === 'GET') {
          return [];
        }
        throw new Error('You do not have permission to perform this action');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: IUser }> {
    const response = await fetch(`${this.API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  }

  async register(userData: Partial<IUser>): Promise<{ token: string; user: IUser }> {
    const response = await fetch(`${this.API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  }

  async validateToken(): Promise<IUser> {
    try {
      const response = await fetch(`${this.API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Token validation failed');
      }
      return response.json();
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  }

  // Users
  async getCurrentUser(): Promise<IUser> {
    return this.fetchWithAuth('/users/me');
  }

  async getUsers(): Promise<IUser[]> {
    try {
      const response = await this.fetchWithAuth('/users');
      // The backend returns { users: [...] }, so we need to extract the users array
      return response?.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<IUser> {
    return this.fetchWithAuth(`/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
    return this.fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return this.fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Products
  async getProducts(params: { page: number; limit: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<{ products: IProduct[]; total: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.fetchWithAuth(`/products?${queryParams.toString()}`);
  }

  async getProductById(id: string): Promise<IProduct> {
    return this.fetchWithAuth(`/products/${id}`);
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    return this.fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct> {
    return this.fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
    sortBy?: string; 
    sortOrder?: string 
  }): Promise<{ orders: IOrder[]; total: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }

    return this.fetchWithAuth(`/orders?${queryParams.toString()}`);
  }

  async getMyOrders(): Promise<IOrder[]> {
    return this.fetchWithAuth('/orders/my-orders');
  }

  async getOrderById(id: string): Promise<IOrder> {
    return this.fetchWithAuth(`/orders/${id}`);
  }

  async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    return this.fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: Partial<IOrder>): Promise<IOrder> {
    return this.fetchWithAuth(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string): Promise<void> {
    return this.fetchWithAuth(`/orders/${id}`, {
      method: 'DELETE',
    });
  }
}

export const mongoDBService = new MongoService();