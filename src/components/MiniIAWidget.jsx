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
      // LLamar a la API de MiniIA en el servidor (a través del proxy /api/chat que configuraremos)
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
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="mt-2 mb-2"><img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #4361ee; text-decoration: underline;">$1</a>');
    return { __html: html };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" style={{ fontFamily: 'sans-serif' }}>
      
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-white text-black w-[90vw] md:w-96 h-[80vh] md:h-[500px] max-h-[80vh] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-4 flex flex-col overflow-hidden border border-gray-200 transform transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                 {/* Aperture SVG Mini */}
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94"/><path d="M9.69 8h11.48"/><path d="M7.38 12l5.74-9.94"/><path d="M9.69 16L3.95 6.06"/><path d="M14.31 16H2.83"/><path d="M16.62 12l-5.74 9.94"/></svg>
                 <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
              </div>
              <div className="flex flex-col text-left">
                <h3 className="font-bold leading-none text-[15px] m-0 p-0">JavierMix IA</h3>
                <p className="text-[11px] text-gray-300 m-0 p-0 mt-0.5">Asistente de Fotografía</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col text-left text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}
                  dangerouslySetInnerHTML={formatMessage(m.text)}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-gray-100 border border-transparent rounded-full pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-none cursor-pointer flex items-center justify-center"
              >
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tooltip y Botón Flotante */}
      <div className="relative flex items-center" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        
        {/* Tooltip */}
        {!isOpen && (
          <div 
            className={`absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white text-black px-4 py-2 rounded-xl shadow-lg border border-gray-200 text-sm font-medium transition-all duration-300 origin-right ${
              isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-2 pointer-events-none'
            }`}
          >
            ¿Quieres que te ayude con algo?
            <br />
            <span className="text-gray-500 text-xs font-normal">Soy JavierMix IA</span>
            {/* Triángulo */}
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-200 rotate-45"></div>
          </div>
        )}

        {/* Botón Flotante (Obturador) */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`w-16 h-16 bg-black rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-center text-white border-[3px] border-white/10 transition-all duration-300 hover:scale-110 hover:border-white/30 cursor-pointer p-0 relative`}
          >
            <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-white/20 animate-spin`} style={{ animationDuration: '3s' }}></div>
            <div className={`transition-transform duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isHovered ? 'rotate-90 scale-110' : 'rotate-0'}`}>
              {/* Shutter / Aperture SVG */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                <circle cx="12" cy="12" r="10" />
                <path d="M14.31 8l5.74 9.94" />
                <path d="M9.69 8h11.48" />
                <path d="M7.38 12l5.74-9.94" />
                <path d="M9.69 16L3.95 6.06" />
                <path d="M14.31 16H2.83" />
                <path d="M16.62 12l-5.74 9.94" />
              </svg>
            </div>
            {/* Green Dot Online */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></span>
          </button>
        )}
      </div>
    </div>
  );
}
