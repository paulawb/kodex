import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  quantity: number;
  /** Unidades disponibles de esta talla/color. Si no se conoce, no se limita. */
  stock?: number;
}

function maxAllowed(item: { stock?: number }): number {
  return typeof item.stock === "number" && item.stock >= 0 ? item.stock : Number.MAX_SAFE_INTEGER;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color?: string) => void;
  updateQuantity: (id: string, size: string, quantity: number, color?: string) => void;
  syncStock: (products: any[]) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const items = get().items;
        const limit = maxAllowed(newItem);

        const existingItem = items.find(
          (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
        );

        if (existingItem) {
          const nextQuantity = Math.min(existingItem.quantity + newItem.quantity, limit);
          if (nextQuantity === existingItem.quantity) return;
          set({
            items: items.map((item) =>
              item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
                ? { ...item, quantity: nextQuantity, stock: newItem.stock ?? item.stock }
                : item
            ),
          });
        } else {
          const quantity = Math.min(newItem.quantity, limit);
          if (quantity <= 0) return;
          set({ items: [...items, { ...newItem, quantity }] });
        }
      },
      removeItem: (id, size, color) => {
        set({
          items: get().items.filter((item) => !(item.id === id && item.size === size && item.color === color)),
        });
      },
      updateQuantity: (id, size, quantity, color) => {
        if (quantity <= 0) {
          get().removeItem(id, size, color);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id && item.size === size && item.color === color
              ? { ...item, quantity: Math.min(quantity, maxAllowed(item)) }
              : item
          ),
        });
      },
      syncStock: (products) => {
        if (!Array.isArray(products)) return;

        const stockByKey = new Map<string, number>();
        for (const product of products) {
          for (const color of product?.colors || []) {
            for (const variant of color?.variants || []) {
              stockByKey.set(
                `${product.id}|${color.name}|${variant.size}`,
                Number(variant.stock) || 0
              );
            }
          }
        }

        set({
          items: get()
            .items.map((item) => {
              const stock = stockByKey.get(`${item.id}|${item.color}|${item.size}`);
              if (stock === undefined) return item;
              return { ...item, stock, quantity: Math.max(0, Math.min(item.quantity, stock)) };
            })
            .filter((item) => item.quantity > 0),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "kodex-cart",
    }
  )
);
