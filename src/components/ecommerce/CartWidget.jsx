import { useStore } from '@nanostores/preact';
import { cartItems, isCartOpen, removeItem, clearCart, getCartSubtotal } from '../../store/cartStore';
import { useEffect, useState } from 'preact/hooks';

/**
 * 🛒 CartWidget (Preact)
 * 
 * El panel lateral del Motor V8. Gestiona la visualización del carrito
 * y el disparo del Checkout seguro.
 */
export default function CartWidget() {
    const $cartItems = useStore(cartItems);
    const $isCartOpen = useStore(isCartOpen);
    const [isProcessing, setIsProcessing] = useState(false);

    const itemsArray = Object.values($cartItems);
    const subtotal = getCartSubtotal();

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: itemsArray })
            });
            const data = await res.json();
            if (data.init_point) {
                window.location.href = data.init_point; // Redirección a Mercado Pago
            } else {
                alert('Error al iniciar el pago: ' + data.error);
            }
        } catch (e) {
            console.error('Checkout error:', e);
            alert('Error de conexión con el motor de pagos.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!$isCartOpen && itemsArray.length === 0) return null;

    return (
        <aside className={`cart-drawer ${$isCartOpen ? 'is-open' : ''}`}>
            <div className="cart-overlay" onClick={() => isCartOpen.set(false)}></div>
            <div className="cart-panel">
                <header className="cart-header">
                    <h2>TU SELECCIÓN</h2>
                    <button className="close-cart" onClick={() => isCartOpen.set(false)}>×</button>
                </header>

                <div className="cart-content">
                    {itemsArray.length === 0 ? (
                        <div className="cart-empty">
                            <p>Tu carrito está vacío</p>
                            <a href="/galeria" className="btn-explore">EXPLORAR COLECCIÓN</a>
                        </div>
                    ) : (
                        <ul className="cart-items-list">
                            {itemsArray.map(item => (
                                <li key={item.id} className="cart-item">
                                    <div className="item-info">
                                        <h4>{item.title}</h4>
                                        <p className="item-price">{item.price} ARS</p>
                                    </div>
                                    <div className="item-qty">
                                        <button onClick={() => removeItem(item.id)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => addItem(item)} style={{opacity: 0.3, cursor: 'not-allowed'}}>+</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {itemsArray.length > 0 && (
                    <footer className="cart-footer">
                        <div className="cart-summary">
                            <span>TOTAL (Estimado)</span>
                            <span className="total-price">{subtotal} ARS</span>
                        </div>
                        <button 
                            className="btn-checkout" 
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'PROCESANDO...' : 'FINALIZAR COMPRA'}
                        </button>
                    </footer>
                )}
            </div>
        </aside>
    );
}
