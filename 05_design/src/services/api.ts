import axios from 'axios';
import { Product, ProductCreate, ProductUpdate, CartItem, CartItemRequest } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products/');
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: ProductCreate): Promise<Product> => {
    const response = await api.post('/products/', product);
    return response.data;
  },

  update: async (id: number, product: ProductUpdate): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};

export const cartService = {
  addToCart: async (cartItem: CartItemRequest): Promise<void> => {
    await api.post('/cart/add', cartItem);
  },

  getCart: async (sessionId: string): Promise<CartItem[]> => {
    const response = await api.get(`/cart/${sessionId}`);
    return response.data;
  },

  removeFromCart: async (sessionId: string, productId: number): Promise<void> => {
    await api.delete(`/cart/${sessionId}/${productId}`);
  },

  getAvailableStock: async (sessionId: string, productId: number): Promise<number> => {
    const response = await api.get(`/cart/${sessionId}/available-stock/${productId}`);
    return response.data.available_stock;
  }
};
