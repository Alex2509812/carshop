import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Package, Plus, Trash2, X, AlertCircle,
  ShoppingBag, DollarSign, Layers, ImageIcon
} from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  detalles: string;
  stock: number;
}

const estadoInicial = {
  nombre: '',
  precio: 0,
  categoria: 'Detallado',
  imagen: '',
  detalles: '',
  stock: 0,
};

const AdminDashboard = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevoProd, setNuevoProd] = useState(estadoInicial);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: false });
    if (error) console.error('Error:', error.message);
    else setProductos(data || []);
    setLoading(false);
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!nuevoProd.nombre.trim()) {
      setError('El nombre del producto es obligatorio.');
      setIsSaving(false);
      return;
    }
    if (nuevoProd.precio <= 0) {
      setError('El precio debe ser mayor a $0.');
      setIsSaving(false);
      return;
    }

    try {
       console.log('Intentando insertar:', nuevoProd); // ← 
    const { data, error } = await supabase.from('productos').insert([{
  nombre: nuevoProd.nombre.trim(),
  precio: nuevoProd.precio,
  categoria: nuevoProd.categoria,
  imagen: nuevoProd.imagen.trim(),
  detalles: nuevoProd.detalles.trim(),
  stock: nuevoProd.stock,
}]).select();

console.log('RESULTADO:', data, 'ERROR:', error);

      if (error) throw error;

      setNuevoProd(estadoInicial);
      setShowModal(false);
      await fetchProductos();
    } catch (err: any) {
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) alert(`Error: ${error.message}`);
    else setProductos(prev => prev.filter(p => p.id !== id));
  };

  // Stats
  const totalProductos = productos.length;
  const valorInventario = productos.reduce((a, p) => a + p.precio * p.stock, 0);
  const sinStock = productos.filter(p => p.stock === 0).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e8e8e8', fontFamily: "'DM Sans', sans-serif", padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#4a6cf7', textTransform: 'uppercase', marginBottom: 4 }}>Panel de Control</p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.5 }}>CarShop Admin</h1>
          </div>
          <button
            onClick={() => { setShowModal(true); setError(null); setNuevoProd(estadoInicial); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#4a6cf7', color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 20px', fontSize: 13,
              fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5,
            }}
          >
            <Plus size={16} /> Agregar Producto
          </button>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: '2rem' }}>
          {[
            { label: 'Total Productos', value: totalProductos, icon: <Package size={20} />, color: '#4a6cf7' },
            { label: 'Valor del Inventario', value: `$${valorInventario.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#22c55e' },
            { label: 'Sin Stock', value: sinStock, icon: <AlertCircle size={20} />, color: sinStock > 0 ? '#ef4444' : '#22c55e' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#1a1d27', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>{stat.label}</p>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ background: '#1a1d27', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={18} color="#4a6cf7" />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Inventario de productos</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555', background: '#0f1117', padding: '3px 10px', borderRadius: 20 }}>{totalProductos} registros</span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#555', fontSize: 14 }}>Cargando inventario...</div>
          ) : productos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#555', fontSize: 14 }}>No hay productos aún. ¡Agrega el primero!</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Detalles', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod, i) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        {prod.imagen ? (
                          <img src={prod.imagen} alt={prod.nombre} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={18} color="#444" />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{prod.nombre}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(74,108,247,0.12)', color: '#4a6cf7', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{prod.categoria}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#22c55e' }}>${prod.precio.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: prod.stock === 0 ? '#ef4444' : prod.stock < 5 ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>
                          {prod.stock}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#666', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.detalles || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => eliminarProducto(prod.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1a1d27', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>Nuevo Producto</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#555', marginTop: 2 }}>Completa todos los campos</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <form onSubmit={guardarProducto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre del producto *</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Ej: Shampoo pH Neutro 1L"
                  value={nuevoProd.nombre}
                  onChange={e => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
                  required
                />
              </div>

              {/* Detalles */}
              <div>
                <label style={labelStyle}>Descripción / Detalles</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Ej: Fórmula concentrada, apto para todos los colores..."
                  value={nuevoProd.detalles}
                  onChange={e => setNuevoProd({ ...nuevoProd, detalles: e.target.value })}
                />
              </div>

              {/* Categoría + Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select
                    style={inputStyle}
                    value={nuevoProd.categoria}
                    onChange={e => setNuevoProd({ ...nuevoProd, categoria: e.target.value })}
                  >
                    <option value="Detallado">Detallado</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Limpieza">Limpieza</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Stock (unidades) *</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={nuevoProd.stock}
                    onChange={e => setNuevoProd({ ...nuevoProd, stock: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Precio */}
              <div>
                <label style={labelStyle}>Precio (MXN) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 14, fontWeight: 700 }}>$</span>
                  <input
                    style={{ ...inputStyle, paddingLeft: 28 }}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={nuevoProd.precio || ''}
                    onChange={e => setNuevoProd({ ...nuevoProd, precio: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* URL Imagen */}
              <div>
                <label style={labelStyle}>URL de la imagen</label>
                <input
                  style={inputStyle}
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={nuevoProd.imagen}
                  onChange={e => setNuevoProd({ ...nuevoProd, imagen: e.target.value })}
                />
                {nuevoProd.imagen && (
                  <img src={nuevoProd.imagen} alt="preview" style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ flex: 1, background: isSaving ? '#333' : '#4a6cf7', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Producto'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#888', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: 1.5,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f1117',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: '#e8e8e8',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export default AdminDashboard;