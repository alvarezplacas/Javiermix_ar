import { persistentMap } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  framing?: {
    type: string;
    paspartu: boolean;
    price: number;
  };
}

export type CartStoreType = Record<string, CartItem>;

// 🛒 Store principal (Persistente)
export const cartItems = persistentMap<CartStoreType>(
  'javiermix-cart-v8:',
  {},
  {
    encode: JSON.stringify,
    decode: (val) => {
        try {
            return JSON.parse(val);
        } catch (e) {
            return {};
        }
    }
  }
);

/** @deprecated Use cartItems instead */
export const cartStore = cartItems;

// ⚡ Estado del Drawer
export const isCartOpen = atom(false);

// 📏 Selección actual (para sincronizar tamaños)
export const currentSelection = atom({
    price: 0,
    label: '',
    dimensions: ''
});

export const currentFraming = atom<{
    type: string;
    paspartu: boolean;
    price: number;
} | null>(null);

// 🛠️ Acciones
export function addItem(item: Omit<CartItem, 'quantity'>) {
    const cart = cartItems.get();
    if (cart[item.id]) {
        cartItems.setKey(item.id, {
            ...cart[item.id],
            quantity: cart[item.id].quantity + 1
        });
    } else {
        cartItems.setKey(item.id, {
            ...item,
            quantity: 1
        });
    }
    // Abrir el carrito al añadir
    isCartOpen.set(true);
}

export function removeItem(id: string) {
    const cart = cartItems.get();
    if (cart[id]) {
        if (cart[id].quantity > 1) {
            cartItems.setKey(id, {
                ...cart[id],
                quantity: cart[id].quantity - 1
            });
        } else {
            const newCart = { ...cart };
            delete newCart[id];
            cartItems.set(newCart);
        }
    }
}

export function clearCart() {
    cartItems.set({});
}

// 🧮 Computados
export const getCartSubtotal = computed(cartItems, (items) => {
    return Object.values(items).reduce((acc, item) => acc + (item.price * item.quantity), 0);
});
