import { persistentMap } from '@nanostores/persistent';

export interface CartItem {
  id: string;
  artworkId: string;
  title: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

export type CartStoreType = Record<string, CartItem>;

export const cartStore = persistentMap<CartStoreType>(
  'javiermix-cart:',
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

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

export function clearCart() {
    cartStore.set({});
}
