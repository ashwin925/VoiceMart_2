import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isOpen: false,
      loading: false,

      // Actions
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.product._id === product._id);

        if (existingItem) {
          // Update quantity if item exists
          set({
            items: items.map(item =>
              item.product._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          // Add new item
          set({
            items: [...items, { product, quantity }]
          });
        }

        // Show success message
        if (typeof window !== 'undefined') {
          alert('Added to Cart!');
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        set({
          items: items.filter(item => item.product._id !== productId)
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { items } = get();
        set({
          items: items.map(item =>
            item.product._id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },

      setIsOpen: (isOpen) => set({ isOpen }),

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
);