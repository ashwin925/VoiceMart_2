import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      loading: false,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find(i => i.product._id === product._id);
        if (existing) {
          set({ items: items.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
        if (typeof window !== 'undefined') alert('Added to Cart!');
      },

      removeItem: (productId) => set(state => ({ items: state.items.filter(i => i.product._id !== productId) })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) return get().removeItem(productId);
        set(state => ({ items: state.items.map(i => i.product._id === productId ? { ...i, quantity } : i) }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((t, i) => t + (i.product.price * i.quantity), 0),

      setIsOpen: (isOpen) => set({ isOpen }),
      setLoading: (loading) => set({ loading }),
    }),
    { name: 'cart-storage' }
  )
);