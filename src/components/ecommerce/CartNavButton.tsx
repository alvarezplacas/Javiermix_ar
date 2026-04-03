import { useStore } from '@nanostores/preact';
import { cartItems, isCartOpen } from '../../store/cartStore';

/**
 * 🛒 CartNavButton (Preact)
 * 
 * El icono dorado del menú de navegación. 
 * Reemplaza el texto "Carrito" por una pieza de joyería visual reactiva.
 */
export default function CartNavButton() {
    const $cartItems = useStore(cartItems);
    const $isCartOpen = useStore(isCartOpen);
    
    const itemsArray = Object.values($cartItems);
    const totalItems = itemsArray.reduce((acc, item: any) => acc + item.quantity, 0);

    return (
        <button 
            className={`cart-nav-btn ${totalItems > 0 ? 'has-items' : ''}`}
            onClick={() => isCartOpen.set(true)}
            aria-label="Ver carrito"
        >
            <i className="fas fa-shopping-bag"></i>
            {totalItems > 0 && (
                <span className="cart-count-badge">
                    {totalItems}
                </span>
            )}
        </button>
    );
}
