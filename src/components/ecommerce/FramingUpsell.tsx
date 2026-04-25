import { useStore } from '@nanostores/preact';
import { currentFraming } from '@store/cartStore';

export default function FramingUpsell() {
    const $framing = useStore(currentFraming);

    const openStudio = () => {
        const studio = document.getElementById('framing-studio');
        if (studio) {
            studio.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };

    return (
        <div className="framing-upsell-card">
            <div className="upsell-header">
                <span className="upsell-label">ACABADO Y ENMARCADO</span>
                {!$framing && <span className="upsell-badge">RECOMENDACIÓN DE AUTOR</span>}
            </div>

            <div className="upsell-body">
                { $framing ? (
                    <div className="upsell-selection">
                        <div className="selection-info">
                            <span className="selection-type">MARCO: {$framing.type}</span>
                            <span className="selection-mat">{$framing.paspartu ? 'CON PASPARTÚ' : 'SIN PASPARTÚ'}</span>
                        </div>
                        <button onClick={openStudio} className="upsell-change-btn">CAMBIAR</button>
                    </div>
                ) : (
                    <div className="upsell-placeholder">
                        <p>Esta obra alcanza su máxima potencia con un enmarcado artesanal.</p>
                        <button onClick={openStudio} className="upsell-action-btn">
                            AÑADIR ENMARCADO PREMIUM
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .framing-upsell-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    transition: all 0.4s ease;
                }
                .upsell-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .upsell-label {
                    font-size: 0.6rem;
                    letter-spacing: 2px;
                    color: var(--color-travertine-muted);
                    text-transform: uppercase;
                }
                .upsell-badge {
                    font-size: 0.5rem;
                    background: var(--color-accent);
                    color: #000;
                    padding: 2px 6px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                .upsell-placeholder p {
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                    margin-bottom: 1rem;
                    font-style: italic;
                }
                .upsell-action-btn {
                    width: 100%;
                    background: transparent;
                    border: 1px solid var(--color-accent);
                    color: var(--color-accent);
                    padding: 0.8rem;
                    font-size: 0.65rem;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .upsell-action-btn:hover {
                    background: rgba(220, 177, 74, 0.1);
                }
                .upsell-selection {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .selection-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .selection-type {
                    font-size: 0.8rem;
                    color: var(--color-white);
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .selection-mat {
                    font-size: 0.6rem;
                    color: var(--color-accent);
                }
                .upsell-change-btn {
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted);
                    font-size: 0.6rem;
                    text-decoration: underline;
                    cursor: pointer;
                    letter-spacing: 1px;
                }
            `}</style>
        </div>
    );
}
