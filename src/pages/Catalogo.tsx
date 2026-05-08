import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Droplets, Loader2 } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  detalles: string;
}

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProductos = async () => {
    try {
      setLoading(true);
      if (supabase) {
        const { data, error } = await supabase.from('productos').select('*');
        if (error) throw error;
        if (data) setProductos(data);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // ✅ Si no hay sesión, manda al login
  const handleAddToCart = (prod: Producto) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(prod);
  };

  const productosFiltrados = filtro === "Todos"
    ? productos
    : productos.filter(p => p.categoria === filtro);

  const getIcon = (cat: string) => {
    if (cat === "Detallado") return <Droplets className="w-5 h-5 text-blue-500" />;
    return <Package className="w-5 h-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-slate-400">Cargando Stock...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
          Nuestro <span className="text-blue-600">Catálogo Real</span>
        </h2>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          {["Todos", "Accesorios", "Detallado"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-6 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                filtro === cat ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {productosFiltrados.map((prod) => (
          <div key={prod.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-100 transition-all group">
            <div className="relative overflow-hidden">
              <img src={prod.imagen} alt={prod.nombre} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                {prod.categoria}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-slate-900">{prod.nombre}</h3>
              <p className="text-2xl font-black text-blue-600 mb-4">
                ${prod.precio.toLocaleString()} <span className="text-[10px] font-normal text-gray-400 uppercase">mxn</span>
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {getIcon(prod.categoria)}
                <span className="font-medium">{prod.detalles}</span>
              </div>
              <button
                onClick={() => handleAddToCart(prod)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
              >
                <ShoppingCart size={18} />
                {user ? 'Agregar al Carrito' : 'Iniciar sesión para comprar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}