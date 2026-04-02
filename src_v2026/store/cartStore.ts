import { persistentMap } from '@nanostores/persistent';

export interface CartItem {
  id: string;      // Identificador único (ej: AR-001-Small)
  artworkId: string; // Slug de la obra original
  title: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

export type CartStoreType = Record<string, CartItem>;

// Persistent store automatically syncs with localStorage
export const cartStore = persistentMap<CartStoreType>(
  'javiermix-cart:',
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

// Helper functions for easy cart interaction
export function addCartItem(item: Omit<CartItem, 'quantity' | 'id'>) {
    const id = `${item.artworkId}-${item.size}`;
    const cart = cartStore.get();
    
    if (cart[id]) {
        cartStore.setKey(id, {
            ...cart[id],
            quantity: cart[id].quantity + 1
        });
    } else {
        cartStore.setKey(id, {
            ...item,
            id,
            quantity: 1
        });
    }
}

export function removeCartItem(id: string) {
    const cart = { ...cartStore.get() };
    delete cart[id];
    cartStore.set(cart);
}

export function clearCart() {
    cartStore.set({});
}

export function getCartTotal() {
    const cart = cartStore.get();
    return Object.values(cart).reduce((total, item) => total + (item.price * item.quantity), 0);
}
