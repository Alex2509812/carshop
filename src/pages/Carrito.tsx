import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import {
  Trash2, CreditCard, ArrowLeft, Plus, Minus,
  ShoppingCart, Sparkles, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface ProductoRecomendado {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  detalles: string;
  stock: number;
}

const PREF_KEY = 'carshop-pending-preference';

export default function Carrito() {
  const { cart, removeFromCart, updateQuantity, total, addToCart, clearCart } = useCart();
  const { user } = useAuth();
  const [procesando, setProcesando] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Estado del pago al volver de Mercado Pago ──────────────────────────
  const [estadoPago, setEstadoPago] = useState<'exito' | 'error' | 'pendiente' | null>(null);
  const [guardandoPedido, setGuardandoPedido] = useState(false);

  // ── Recomendaciones ────────────────────────────────────────────────────
  const [recomendaciones, setRecomendaciones] = useState<ProductoRecomendado[]>([]);
  const [cargandoRecomendaciones, setCargandoRecomendaciones] = useState(false);

  // =====================================================
  // Guardar pedido cuando se vuelve de Mercado Pago
  // =====================================================
  useEffect(() => {
    const status = searchParams.get('status');
    if (!status) return;

    if (status === 'success') {
      guardarPedidoAprobado();
    } else if (status === 'failure') {
      setEstadoPago('error');
      limpiarQuery();
    } else if (status === 'pending') {
      setEstadoPago('pendiente');
      limpiarQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const limpiarQuery = () => {
    // Quitar ?status=... de la URL sin recargar
    const params = new URLSearchParams(searchParams);
    params.delete('status');
    setSearchParams(params, { replace: true });
  };

  const guardarPedidoAprobado = async () => {
    if (guardandoPedido) return;
    setGuardandoPedido(true);

    try {
      const preferenceId = localStorage.getItem(PREF_KEY);

      // Evitar duplicados: si ya existe un pedido con esta preference_id, no insertar
      if (preferenceId) {
        const { data: existente } = await supabase
          .from('pedidos')
          .select('id')
          .eq('preference_id', preferenceId)
          .maybeSingle();
        if (existente) {
          localStorage.removeItem(PREF_KEY);
          clearCart();
          setEstadoPago('exito');
          limpiarQuery();
          setGuardandoPedido(false);
          return;
        }
      }

      if (!user) {
        setEstadoPago('error');
        limpiarQuery();
        setGuardandoPedido(false);
        return;
      }

      // 1. Insertar pedido
      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .insert([
          {
            user_id: user.id,
            total,
            status: 'approved',
            preference_id: preferenceId,
          },
        ])
        .select('id')
        .single();

      if (errorPedido) throw errorPedido;

      // 2. Insertar items
      const itemsInsert = cart.map((item) => ({
        pedido_id: pedido.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      }));

      const { error: errorItems } = await supabase
        .from('pedido_items')
        .insert(itemsInsert);
      if (errorItems) throw errorItems;

      // 3. Limpiar
      localStorage.removeItem(PREF_KEY);
      clearCart();
      setEstadoPago('exito');
      limpiarQuery();
    } catch (err: unknown) {
      console.error('Error guardando pedido:', err);
      setEstadoPago('error');
      limpiarQuery();
    } finally {
      setGuardandoPedido(false);
    }
  };

  // =====================================================
  // Checkout → Mercado Pago
  // =====================================================
  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return;
    setProcesando(true);

    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, userId: user.id }),
      });

      const data = await response.json();

      if (data.init_point) {
        // Guardar preference_id para evitar duplicados al volver
        if (data.id) localStorage.setItem(PREF_KEY, data.id);
        window.location.href = data.init_point;
      } else {
        alert('Error al procesar el pago. Intenta de nuevo.');
      }
    } catch {
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  // =====================================================
  // Recomendaciones "Los clientes que compraron esto
  // también compraron..."
  // =====================================================
  useEffect(() => {
    if (cart.length === 0) {
      setRecomendaciones([]);
      return;
    }

    let cancelado = false;
    setCargandoRecomendaciones(true);

    const ids = cart.map((item) => item.id).join(',');

    // Debounce: esperar a que el carrito deje de cambiar
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recomendaciones?items=${ids}`);
        if (!res.ok) throw new Error('Error en la API');
        const data = await res.json();
        if (!cancelado) {
          setRecomendaciones(data.recomendaciones || []);
        }
      } catch (err) {
        console.error('Error cargando recomendaciones:', err);
        if (!cancelado) setRecomendaciones([]);
      } finally {
        if (!cancelado) setCargandoRecomendaciones(false);
      }
    }, 400);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [cart]);

  // =====================================================
  // UI — Estado: pago exitoso
  // =====================================================
  if (estadoPago === 'exito') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <CheckCircle2 size={64} className="text-green-500 mb-4" />
        <h2 className="text-2xl font-black uppercase text-slate-900 mb-2">
          ¡Compra realizada!
        </h2>
        <p className="text-gray-500 mb-8">
          Tu pedido fue guardado correctamente. Gracias por comprar en CarShop.
        </p>
        <div className="flex gap-4">
          <Link
            to="/catalogo"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-sm flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI — Estado: guardando pedido
  // =====================================================
  if (guardandoPedido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="font-black uppercase tracking-widest text-slate-400">
          Guardando tu pedido...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI — Carrito vacío
  // =====================================================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-black uppercase text-slate-400 mb-4">
          {estadoPago === 'error'
            ? 'El pago no se completó'
            : 'Tu carrito está vacío'}
        </h2>
        {estadoPago === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle size={16} />
            Tu carrito se conservó. Puedes intentar de nuevo.
          </div>
        )}
        <Link
          to="/catalogo"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-sm flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
      </div>
    );
  }

  // =====================================================
  // UI — Carrito con productos
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-black uppercase mb-10 text-slate-900">
          Tu <span className="text-blue-600">Carrito</span>
        </h2>

        {estadoPago === 'pendiente' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={16} />
            Tu pago está pendiente de confirmación. Guardaremos el pedido cuando se apruebe.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm gap-4"
              >
                <img
                  src={item.imagen}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  alt={item.nombre}
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-900">{item.nombre}</h4>
                  <p className="text-blue-600 font-black">
                    ${item.precio.toLocaleString()} MXN
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                    aria-label="Reducir cantidad"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-sm w-6 text-center">{item.cantidad}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-black text-slate-900 w-24 text-right">
                  ${(item.precio * item.cantidad).toLocaleString()}
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 p-2"
                  aria-label={`Eliminar ${item.nombre}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white h-fit sticky top-24 shadow-xl">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
              Resumen
            </p>
            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-medium">Total:</span>
              <span className="text-3xl font-black">
                ${total.toLocaleString()}{' '}
                <span className="text-[10px] text-gray-400">MXN</span>
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={procesando || !user}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              <CreditCard size={20} />
              {procesando ? 'Procesando...' : 'Pagar ahora'}
            </button>
            {!user && (
              <p className="text-[10px] text-center mt-3 text-amber-400 uppercase tracking-widest">
                Inicia sesión para pagar
              </p>
            )}
            <p className="text-[9px] text-center mt-4 text-gray-500 uppercase tracking-widest">
              Pago seguro con Mercado Pago
            </p>
          </div>
        </div>

        {/* =====================================================
            SECCIÓN DE RECOMENDACIONES
            "Los clientes que compraron esto también compraron..."
            ===================================================== */}
        {(recomendaciones.length > 0 || cargandoRecomendaciones) && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-blue-600 w-6 h-6" />
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                Los clientes que compraron esto
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-8 font-light">
              También compraron...
            </p>

            {cargandoRecomendaciones ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 size={20} className="animate-spin text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Buscando recomendaciones...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recomendaciones.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-100 transition-all group"
                  >
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                        {prod.categoria}
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">
                        {prod.nombre}
                      </h4>
                      <p className="text-xl font-black text-blue-600 mb-4">
                        ${prod.precio.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-gray-400 uppercase">
                          mxn
                        </span>
                      </p>
                      <button
                        onClick={() =>
                          addToCart({
                            id: prod.id,
                            nombre: prod.nombre,
                            precio: prod.precio,
                            imagen: prod.imagen,
                          })
                        }
                        disabled={prod.stock === 0}
                        className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={16} />
                        {prod.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
