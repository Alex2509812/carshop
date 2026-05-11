import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Sparkles, ShoppingCart, User } from 'lucide-react';

import { CartProvider, useCart } from './CartContext';
import { AuthProvider, useAuth } from './AuthContext';
import Chatbot from './components/Chatbot';
import AccesibilidadWidget from './components/AccesibilidadWidget';

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
    <Link to="/carrito" className="relative group" aria-label={`Carrito, ${cart.length} productos`}>
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
    <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white/90 backdrop-blur-md z-50" role="navigation" aria-label="Navegación principal">
      <Link to="/" className="flex items-center gap-2" aria-label="CarShop - Ir al inicio">
        <Sparkles className="text-blue-600 w-6 h-6" aria-hidden="true" />
        <span className="font-black tracking-tighter text-xl uppercase italic">CarShop</span>
      </Link>

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
        <CartIcon />
        <div className="hidden md:flex">
          {user ? (
            <button
              onClick={handleLogout}
              className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              aria-label="Cerrar sesión"
            >
              Salir
            </button>
          ) : (
            <Link to="/login" className="hover:text-blue-600 transition" aria-label="Iniciar sesión">
              <User className="w-6 h-6" aria-hidden="true" />
            </Link>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
        >
          <span className={`block w-6 h-0.5 bg-slate-900 transition-all ${menuAbierto ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-all ${menuAbierto ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-all ${menuAbierto ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {menuAbierto && (
        <div id="menu-movil" className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden z-50">
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

// Íconos SVG de redes sociales
function IconFacebook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.493-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V21.88C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.337 3.608 1.312.975.975 1.25 2.242 1.312 3.608.058 1.266.07 1.646.07 4.847s-.012 3.581-.07 4.847c-.062 1.366-.337 2.633-1.312 3.608-.975.975-2.242 1.25-3.608 1.312-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.337-3.608-1.312-.975-.975-1.25-2.242-1.312-3.608C2.175 15.581 2.163 15.201 2.163 12s.012-3.584.07-4.85c.062-1.366.337-2.633 1.312-3.608C4.52 2.567 5.787 2.292 7.153 2.23 8.419 2.175 8.799 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function AppContent() {
  const { role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Saltar al contenido principal */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[99999] focus:bg-blue-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-full focus:font-bold focus:text-sm focus:shadow-xl focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id="contenido-principal" className="flex-grow" tabIndex={-1}>
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

      <footer className="bg-slate-950 text-gray-500 py-12 px-8 border-t border-slate-900" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-white font-bold tracking-tighter uppercase text-sm">CARSHOP © 2026</span>

          {/* Redes Sociales */}
          <div className="flex items-center gap-5">
            <a
              href="https://www.facebook.com/share/1GVP5iYJRd/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de CarShop"
              className="text-gray-400 hover:text-[#1877F2] transition-colors duration-200"
            >
              <IconFacebook />
            </a>
            <a
              href="https://www.instagram.com/car_shopoficial?igsh=MXd2MmducXU1OXZweQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de CarShop"
              className="text-gray-400 hover:text-[#E1306C] transition-colors duration-200"
            >
              <IconInstagram />
            </a>
            <a
              href="https://x.com/miel_reina12345?s=21&t=ujD-kdX3H5cgxmx8igL4ew"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) de CarShop"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <IconX />
            </a>
          </div>
        </div>
      </footer>

      <Chatbot />
      <AccesibilidadWidget />
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
