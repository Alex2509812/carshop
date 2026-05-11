import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, RotateCcw } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Mensaje {
  rol: 'user' | 'bot';
  texto: string;
}

interface Producto {
  nombre: string;
  precio: number;
  categoria: string;
  detalles: string;
  stock: number;
}

const mensajeBienvenida: Mensaje = {
  rol: 'bot',
  texto: '¡Hola! Soy el asistente virtual de CarShop 🚗✨ Estoy aquí para ayudarte con recomendaciones de productos, información sobre detallado automotriz y más. ¿En qué puedo ayudarte hoy?'
};

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([mensajeBienvenida]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { cargarProductos(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargarProductos = async () => {
    const { data } = await supabase.from('productos').select('nombre, precio, categoria, detalles, stock');
    if (data) setProductos(data);
  };

  const reiniciarChat = () => {
    setMensajes([mensajeBienvenida]);
    setInput('');
  };

  const construirPrompt = (pregunta: string) => {
    const listaProductos = productos.length > 0
      ? productos.map(p => `- ${p.nombre} | Categoría: ${p.categoria} | Precio: $${p.precio} MXN | Stock: ${p.stock} unidades | Detalles: ${p.detalles}`).join('\n')
      : 'Actualmente no hay productos disponibles.';

    return `Eres el asistente virtual de CarShop, una tienda especializada en productos de detallado automotriz en México.

INFORMACIÓN DE LA TIENDA:
- Nombre: CarShop
- Horario de atención: Lunes a Domingo de 9:00 AM a 7:00 PM
- Teléfono: 722 902 9569
- Correo: carshopp2@gmail.com
- Ubicación: México

CATÁLOGO ACTUAL DE PRODUCTOS:
${listaProductos}

TUS RESPONSABILIDADES:
1. Recomendar productos según las necesidades del cliente
2. Explicar cómo usar los productos de detallado
3. Informar precios y disponibilidad (stock)
4. Indicar el horario de atención cuando pregunten
5. Dar datos de contacto cuando los pidan
6. Si el cliente quiere comprar, dile que debe iniciar sesión en la página para agregar productos al carrito
7. Si preguntan por productos que no están en el catálogo, di que no contamos con ese producto actualmente
8. Responder dudas sobre cuidado automotriz en general

REGLAS:
- Responde siempre en español
- Sé amigable, profesional y conciso (máximo 4 oraciones)
- No inventes productos que no están en el catálogo
- Si el cliente dice "adiós", "bye", "hasta luego" o similar, despídete amablemente

Pregunta del cliente: ${pregunta}`;
  };

  const enviarMensaje = async () => {
    if (!input.trim() || cargando) return;

    const userMsg = input.trim();
    setInput('');
    setMensajes(prev => [...prev, { rol: 'user', texto: userMsg }]);
    setCargando(true);

    const despedidas = ['adios', 'adiós', 'bye', 'hasta luego', 'chao', 'chau', 'nos vemos'];
    const esDespedida = despedidas.some(d => userMsg.toLowerCase().includes(d));

    try {
      // ✅ Llama a la función serverless en lugar de Gemini directamente
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: construirPrompt(userMsg) }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error del servidor');

      setMensajes(prev => [...prev, { rol: 'bot', texto: data.response }]);

      if (esDespedida) {
        setTimeout(() => setMensajes([mensajeBienvenida]), 3000);
      }
    } catch (error) {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Lo siento, hubo un error. Intenta de nuevo en un momento.' }]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4a6cf7, #2563eb)',
          border: 'none', cursor: 'pointer', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(74,108,247,0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {abierto ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {abierto && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 999,
          width: 340, height: 500, background: '#fff',
          borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ background: 'linear-gradient(135deg, #4a6cf7, #2563eb)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: 14 }}>Asistente CarShop</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Con IA • En línea</p>
            </div>
            <button
              onClick={reiniciarChat}
              title="Reiniciar conversación"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mensajes.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.rol === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px',
                  borderRadius: msg.rol === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.rol === 'user' ? 'linear-gradient(135deg, #4a6cf7, #2563eb)' : '#f1f5f9',
                  color: msg.rol === 'user' ? 'white' : '#1e293b',
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {msg.texto}
                </div>
              </div>
            ))}
            {cargando && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#f1f5f9', borderRadius: '18px 18px 18px 4px', padding: '10px 16px', fontSize: 18, letterSpacing: 4 }}>
                  ···
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                border: '1px solid #e2e8f0', outline: 'none',
                fontSize: 13, fontFamily: 'inherit', background: '#f8fafc',
              }}
            />
            <button
              onClick={enviarMensaje}
              disabled={cargando || !input.trim()}
              style={{
                background: 'linear-gradient(135deg, #4a6cf7, #2563eb)', border: 'none',
                borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
                color: 'white', display: 'flex', alignItems: 'center',
                opacity: cargando || !input.trim() ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}