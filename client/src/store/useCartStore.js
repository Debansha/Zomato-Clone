import { create } from 'zustand';
import api from '../lib/api';

const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/cart');
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addItem: async (menuItemId, quantity = 1, customizations = []) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/cart/items', { menuItemId, quantity, customizations });
      set({ cart: response.data, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/cart/items/${itemId}`, { quantity });
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete('/cart');
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useCartStore;
