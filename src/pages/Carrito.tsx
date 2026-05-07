import { useCart } from '../CartContext';
import { Trash2, CreditCard, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Carrito() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  const handleCheckout = () => {
    alert('Próximamente: Conexión con Mercado Pago API');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-black uppercase text-slate-400 mb-4">Tu carrito está vacío</h2>
        <Link to="/catalogo" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-sm flex items-center gap-2">
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-black uppercase mb-10 text-slate-900">
          Tu <span className="text-blue-600">Carrito</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm gap-4">
                <img src={item.imagen} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" alt={item.nombre} />

                <div className="flex-grow">
                  <h4 className="font-bold text-slate-900">{item.nombre}</h4>
                  <p className="text-blue-600 font-black">${item.precio.toLocaleString()} MXN</p>
                </div>

                {/* ✅ Controles de cantidad */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-sm w-6 text-center">{item.cantidad}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="font-black text-slate-900 w-24 text-right">
                  ${(item.precio * item.cantidad).toLocaleString()}
                </p>

                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white h-fit sticky top-24 shadow-xl">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Resumen de compra</p>
            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-medium">Total:</span>
              <span className="text-3xl font-black">
                ${total.toLocaleString()} <span className="text-[10px] text-gray-400">MXN</span>
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all"
            >
              <CreditCard size={20} /> Pagar ahora
            </button>
            <p className="text-[9px] text-center mt-6 text-gray-500 leading-relaxed uppercase">
              Transacción segura cifrada por Mercado Pago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
