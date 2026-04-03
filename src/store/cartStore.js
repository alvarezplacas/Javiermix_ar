import { atom, map } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

/**
 * 🛒 Motor V8 - Cart Store (Agnóstico)
 * 
 * Gestiona el estado global del carrito con persistencia automática en localStorage.
 * Compatible con Astro, React, Preact y Vanilla JS.
 */

// Estado de visibilidad del carrito (UI)
export const isCartOpen = atom(false);

// Estado de selección actual en la ficha de producto (Precios dinámicos por tamaño)
export const currentSelection = atom({ price: 0, label: '', dimensions: '' });

// El Carrito: Un mapa persistente de items
// Formato: { [id]: { id, quantity, title, price, image, category } }
export const cartItems = persistentMap('javiermix-cart:', {}, {
    encode: JSON.stringify,
    decode: JSON.parse
});

/**
 * Añadir item al carrito
 * @param {Object} item - Objeto con id, title, price, etc.
 */
export function addItem(item) {
    const existing = cartItems.get()[item.id];
    if (existing) {
        cartItems.setKey(item.id, {
            ...existing,
            quantity: existing.quantity + 1
        });
    } else {
        cartItems.setKey(item.id, {
            ...item,
            quantity: 1
        });
    }
    // Opcional: Abrir carrito al añadir
    isCartOpen.set(true);
}

/**
 * Eliminar item o reducir cantidad
 * @param {string} itemId 
 */
export function removeItem(itemId) {
    const existing = cartItems.get()[itemId];
    if (existing) {
        if (existing.quantity > 1) {
            cartItems.setKey(itemId, {
                ...existing,
                quantity: existing.quantity - 1
            });
        } else {
            // Si queda 1, lo borramos del mapa
            const newCart = { ...cartItems.get() };
            delete newCart[itemId];
            cartItems.set(newCart);
        }
    }
}

/**
 * Vaciar carrito
 */
export function clearCart() {
    cartItems.set({});
}

/**
 * Obtener total de items (Helper)
 */
export function getCartCount() {
    const items = Object.values(cartItems.get());
    return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Obtener subtotal (Helper - Recordar validar siempre en Server)
 */
export function getCartSubtotal() {
    const items = Object.values(cartItems.get());
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}
