import { useState, useRef, useEffect } from 'preact/hooks';

export default function MiniIAWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy JavierMix IA. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          domain: 'javiermix.ar',
          user_name: 'Visitante_Javiermix',
          user_role: 'cliente'
        })
      });

      if (!res.ok) {
        throw new Error('Servicio IA no disponible (El administrador debe activarlo en el Dashboard).');
      }

      const data = await res.json();
      if (data.status === 'success') {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      } else {
        throw new Error(data.detail || 'Error en respuesta');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: err.message || 'Lo siento, mi conexión con el cerebro principal está interrumpida.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="mini-ia-response-img-container"><img src="$2" alt="$1" class="mini-ia-response-img" /></div>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="mini-ia-response-link">$1</a>');
    return { __html: html };
  };

  return (
    <div className="mini-ia-container">
      {/* Dynamic Scoped CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        .mini-ia-container {
          position: fixed;
          bottom: 2.5rem;
          left: 2.5rem;
          z-index: 9997;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-family: 'Montserrat', sans-serif;
        }

        .mini-ia-chat-window {
          width: 90vw;
          width: clamp(280px, 90vw, 380px);
          height: 75vh;
          height: clamp(350px, 75vh, 500px);
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          color: #ffffff;
          border-radius: 20px;
          box-shadow: 
            0 24px 60px rgba(0, 0, 0, 0.85), 
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transform-origin: bottom left;
          animation: miniIaScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes miniIaScaleUp {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .mini-ia-header {
          background: linear-gradient(135deg, #151515 0%, #080808 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mini-ia-header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mini-ia-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mini-ia-avatar svg {
          width: 22px;
          height: 22px;
          color: #c5a059;
        }

        .mini-ia-status-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background-color: #10b981;
          border-radius: 50%;
          border: 2px solid #080808;
        }

        .mini-ia-header-text {
          text-align: left;
        }

        .mini-ia-header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-style: italic;
          font-weight: 500;
          letter-spacing: 0.5px;
          margin: 0;
          padding: 0;
          color: #ffffff;
          line-height: 1.1;
        }

        .mini-ia-header-subtitle {
          font-size: 0.65rem;
          color: #a69c94;
          margin: 3px 0 0 0;
          padding: 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .mini-ia-close-btn {
          background: transparent;
          border: none;
          color: #a69c94;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s;
        }

        .mini-ia-close-btn:hover {
          color: #ffffff;
        }

        .mini-ia-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: #080808;
          /* Custom Premium Scrollbar */
          scrollbar-width: thin;
          scrollbar-color: rgba(197, 160, 89, 0.2) transparent;
        }

        .mini-ia-messages::-webkit-scrollbar {
          width: 4px;
        }
        .mini-ia-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .mini-ia-messages::-webkit-scrollbar-thumb {
          background: rgba(197, 160, 89, 0.2);
          border-radius: 2px;
        }

        .mini-ia-message-wrapper {
          display: flex;
          width: 100%;
        }

        .mini-ia-message-wrapper.user {
          justify-content: flex-end;
        }

        .mini-ia-message-wrapper.bot {
          justify-content: flex-start;
        }

        .mini-ia-message-bubble {
          max-width: 85%;
          border-radius: 16px;
          padding: 0.8rem 1.1rem;
          font-size: 0.85rem;
          line-height: 1.6;
          text-align: left;
        }

        .mini-ia-message-bubble.user {
          background: linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%);
          color: #000000;
          border-bottom-right-radius: 2px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(179, 135, 40, 0.15);
        }

        .mini-ia-message-bubble.bot {
          background: rgba(255, 255, 255, 0.03);
          color: #e5e5e5;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom-left-radius: 2px;
        }

        .mini-ia-response-img-container {
          margin: 0.75rem 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(197, 160, 89, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .mini-ia-response-img {
          width: 100%;
          display: block;
          max-height: 240px;
          object-fit: cover;
        }

        .mini-ia-response-link {
          color: #c5a059;
          text-decoration: underline;
          font-weight: 600;
          transition: color 0.2s;
        }
        .mini-ia-response-link:hover {
          color: #ffffff;
        }

        .mini-ia-loading-bubble {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 0.8rem 1.1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border-bottom-left-radius: 2px;
        }

        .mini-ia-dot {
          width: 6px;
          height: 6px;
          background-color: #a69c94;
          border-radius: 50%;
          animation: miniIaDotPulse 1.4s infinite ease-in-out both;
        }

        .mini-ia-dot:nth-child(2) { animation-delay: 0.2s; }
        .mini-ia-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes miniIaDotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .mini-ia-input-container {
          padding: 1rem;
          background: #050505;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .mini-ia-form {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mini-ia-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border-radius: 30px;
          padding: 0.8rem 3.25rem 0.8rem 1.25rem;
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }

        .mini-ia-input:focus {
          background: rgba(255, 255, 255, 0.04);
          border-color: #c5a059;
          box-shadow: 0 0 12px rgba(197, 160, 89, 0.15);
        }

        .mini-ia-submit-btn {
          position: absolute;
          right: 6px;
          width: 34px;
          height: 34px;
          background: #c5a059;
          color: #000000;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .mini-ia-submit-btn:hover:not(:disabled) {
          transform: scale(1.08);
          background: #ffffff;
        }

        .mini-ia-submit-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .mini-ia-submit-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Tooltip */
        .mini-ia-tooltip {
          position: absolute;
          left: 5.25rem;
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform-origin: left;
          text-align: left;
          z-index: 9996;
        }

        .mini-ia-tooltip-sub {
          color: #a69c94;
          font-size: 0.7rem;
          font-weight: 400;
          display: block;
          margin-top: 2px;
        }

        .mini-ia-tooltip-arrow {
          position: absolute;
          top: 50%;
          left: -5px;
          transform: translateY(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: rgba(10, 10, 10, 0.95);
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* FAB Button */
        .mini-ia-fab {
          width: 64px;
          height: 64px;
          background: #000000;
          border-radius: 50%;
          box-shadow: 
            0 12px 35px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          border: 3px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          position: relative;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          padding: 0;
        }

        .mini-ia-fab:hover {
          transform: scale(1.1) translateY(-2px);
          border-color: #c5a059;
          box-shadow: 
            0 20px 45px rgba(197, 160, 89, 0.25),
            0 0 0 1px rgba(197, 160, 89, 0.3);
        }

        .mini-ia-fab-spin {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: rgba(197, 160, 89, 0.4);
          animation: miniIaSpin 3s linear infinite;
          pointer-events: none;
        }

        @keyframes miniIaSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .mini-ia-fab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mini-ia-fab:hover .mini-ia-fab-icon {
          transform: rotate(90deg);
        }

        .mini-ia-online-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background-color: #10b981;
          border-radius: 50%;
          border: 2px solid #000000;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .mini-ia-container {
            bottom: 1.5rem;
            left: 1.5rem;
          }
          .mini-ia-chat-window {
            width: calc(100vw - 3rem);
            max-height: 440px;
            height: 65vh;
            border-radius: 16px;
            margin-bottom: 1rem;
          }
          .mini-ia-fab {
            width: 56px;
            height: 56px;
          }
          .mini-ia-tooltip {
            left: 4.75rem;
          }
        }
      ` }} />

      {/* Chat Window */}
      {isOpen && (
        <div className="mini-ia-chat-window">
          {/* Header */}
          <div className="mini-ia-header">
            <div className="mini-ia-header-info">
              <div className="mini-ia-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94"/><path d="M9.69 8h11.48"/><path d="M7.38 12l5.74-9.94"/><path d="M9.69 16L3.95 6.06"/><path d="M14.31 16H2.83"/><path d="M16.62 12l-5.74 9.94"/></svg>
                <span className="mini-ia-status-dot"></span>
              </div>
              <div className="mini-ia-header-text">
                <h3 className="mini-ia-header-title">JavierMix IA</h3>
                <p className="mini-ia-header-subtitle">Asistente de Fotografía</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="mini-ia-close-btn" aria-label="Cerrar chat">
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="mini-ia-messages">
            {messages.map((m, i) => (
              <div key={i} className={`mini-ia-message-wrapper ${m.role === 'user' ? 'user' : 'bot'}`}>
                <div 
                  className={`mini-ia-message-bubble ${m.role === 'user' ? 'user' : 'bot'}`}
                  dangerouslySetInnerHTML={formatMessage(m.text)}
                />
              </div>
            ))}
            {isLoading && (
              <div className="mini-ia-message-wrapper bot">
                <div className="mini-ia-loading-bubble">
                  <div className="mini-ia-dot"></div>
                  <div className="mini-ia-dot"></div>
                  <div className="mini-ia-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="mini-ia-input-container">
            <form onSubmit={handleSend} className="mini-ia-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="mini-ia-input"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="mini-ia-submit-btn"
                aria-label="Enviar mensaje"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB & Tooltip */}
      <div 
        style={{ position: 'relative', display: 'flex', alignItems: 'center' }} 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        {!isOpen && (
          <div className="mini-ia-tooltip" style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.95)', pointerEvents: isHovered ? 'auto' : 'none' }}>
            ¿Quieres que te ayude con algo?
            <span className="mini-ia-tooltip-sub">Soy JavierMix IA</span>
            <div className="mini-ia-tooltip-arrow"></div>
          </div>
        )}

        {/* Floating Action Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="mini-ia-fab"
            aria-label="Abrir asistente JavierMix IA"
          >
            <div className="mini-ia-fab-spin"></div>
            <div className="mini-ia-fab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '30px', height: '30px' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M14.31 8l5.74 9.94" />
                <path d="M9.69 8h11.48" />
                <path d="M7.38 12l5.74-9.94" />
                <path d="M9.69 16L3.95 6.06" />
                <path d="M14.31 16H2.83" />
                <path d="M16.62 12l-5.74 9.94" />
              </svg>
            </div>
            <span className="mini-ia-online-badge"></span>
          </button>
        )}
      </div>
    </div>
  );
}
