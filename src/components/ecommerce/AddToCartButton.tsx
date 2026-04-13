import { useStore } from '@nanostores/preact';
import { cartItems, addItem, currentSelection } from '@store/cartStore';

/**
 * 🛒 AddToCartButton (Preact)
 * 
 * Componente reactivo que añade el producto al estado global.
 * @param {Object} item - { id, title, price, image }
 */
export default function AddToCartButton({ item }) {
    const $cartItems = useStore(cartItems);
    const $selection = useStore(currentSelection);
    
    // Si hay una selección activa (por tamaño), la priorizamos
    const activePrice = $selection.price > 0 ? $selection.price : item.price;
    const activeLabel = $selection.label || 'Standard';
    
    // Identificador único para la variante
    const variantId = `${item.id}-${activeLabel.toLowerCase()}`;
    const existing = $cartItems[variantId];

    const handleClick = (e) => {
        e.preventDefault();
        addItem({
            ...item,
            id: variantId,
            price: activePrice,
            title: `${item.title} (${activeLabel})`
        });
    };

    return (
        <button 
            onClick={handleClick}
            className={`add-to-cart-btn ${existing ? 'is-added' : ''}`}
            aria-label={`Añadir ${item.title} al carrito`}
        >
            <span className="btn-icon">
                {existing ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                )}
            </span>
            <span className="btn-text">
                {existing ? `AÑADIDO (${existing.quantity})` : 'ADQUIRIR OBRA'}
            </span>
        </button>
    );
}
