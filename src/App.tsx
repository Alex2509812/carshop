import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Sparkles, ShoppingCart, User } from 'lucide-react';

import { CartProvider, useCart } from './CartContext';
import { AuthProvider, useAuth } from './AuthContext';
import Chatbot from './components/Chatbot';

import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import Carrito from './pages/Carrito';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-20 text-center font-bold">Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
};

function CartIcon() {
  const { cart } = useCart();
  return (
    <Link to="/carrito" className="relative group">
      <ShoppingCart className="w-6 h-6 cursor-pointer group-hover:text-blue-600 transition" />
      {cart.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
          {cart.length}
        </span>
      )}
    </Link>
  );
}

  function Navbar() {
  const { role, user, signOut } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white/90 backdrop-blur-md z-50">
      <Link to="/" className="flex items-center gap-2">
        <Sparkles className="text-blue-600 w-6 h-6" />
        <span className="font-black tracking-tighter text-xl uppercase italic">CarShop</span>
      </Link>

      {/* Links desktop */}
      <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest">
        <Link to="/" className="hover:text-blue-600 transition">Inicio</Link>
        <Link to="/catalogo" className="hover:text-blue-600 transition">Catálogo</Link>
        <Link to="/nosotros" className="hover:text-blue-600 transition">Nosotros</Link>
        <Link to="/contacto" className="hover:text-blue-600 transition">Contacto</Link>
        {role === 'admin' && (
          <Link to="/admin" className="text-red-600 font-black hover:text-red-700 transition">Admin</Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Carrito siempre visible */}
        <CartIcon />

        {/* Usuario desktop */}
        <div className="hidden md:flex">
          {user ? (
            <button
              onClick={handleLogout}
              className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Salir
            </button>
          ) : (
            <Link to="/login" className="hover:text-blue-600 transition">
              <User className="w-6 h-6" />
            </Link>
          )}
        </div>

        {/* Botón hamburguesa móvil */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span className={`block w-6 h-0.5 bg-slate-900 transition-all ${menuAbierto ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-all ${menuAbierto ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-all ${menuAbierto ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden z-50">
          <div className="flex flex-col px-6 py-4 gap-4 text-xs font-bold uppercase tracking-widest">
            <Link to="/" onClick={() => setMenuAbierto(false)} className="hover:text-blue-600 transition py-2 border-b border-slate-100">Inicio</Link>
            <Link to="/catalogo" onClick={() => setMenuAbierto(false)} className="hover:text-blue-600 transition py-2 border-b border-slate-100">Catálogo</Link>
            <Link to="/nosotros" onClick={() => setMenuAbierto(false)} className="hover:text-blue-600 transition py-2 border-b border-slate-100">Nosotros</Link>
            <Link to="/contacto" onClick={() => setMenuAbierto(false)} className="hover:text-blue-600 transition py-2 border-b border-slate-100">Contacto</Link>
            {role === 'admin' && (
              <Link to="/admin" onClick={() => setMenuAbierto(false)} className="text-red-600 font-black py-2 border-b border-slate-100">Admin</Link>
            )}
            {user ? (
              <button
                onClick={() => { handleLogout(); setMenuAbierto(false); }}
                className="text-left text-red-600 font-black py-2"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuAbierto(false)} className="hover:text-blue-600 transition py-2">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
  function AppContent() {
  const { role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                {role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      <footer className="bg-slate-950 text-gray-500 py-12 px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-white font-bold tracking-tighter uppercase text-sm">CARSHOP © 2026</span>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;