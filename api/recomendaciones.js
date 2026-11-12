import { createClient } from '@supabase/supabase-js';
import { combinations } from './utils/combinations.js';

// =====================================================
// API: Recomendaciones "Los clientes que compraron
// esto también compraron..." — reglas de asociación
// Port del código Python de mercado (apriori ligero)
// =====================================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SOPORT_MINIMO = 0.1;
const CONFIANZA_MINIMA = 0.3;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno',
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const itemsParam = req.query.items || '';
    const cartItems = itemsParam
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));

    // ── 1. Productos ACTUALES del catálogo ────────────────────────────────
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('id, nombre, precio, categoria, imagen, detalles, stock');
    if (errorProductos) throw errorProductos;

    const productosMap = new Map(productos.map((p) => [p.id, p]));
    const idsValidos = new Set(productosMap.keys());
    const cartSet = new Set(cartItems);

    // ── 2. Reglas de asociación (si hay pedidos) ──────────────────────────
    // Si no hay datos, reglas queda vacía y seguimos al fallback
    let recomendaciones = [];

    try {
      const { data: pedidos, error: errorPedidos } = await supabase
        .from('pedidos')
        .select('id, status')
        .eq('status', 'approved');

      if (!errorPedidos && pedidos && pedidos.length > 0) {
        const { data: items, error: errorItems } = await supabase
          .from('pedido_items')
          .select('pedido_id, producto_id')
          .in(
            'pedido_id',
            pedidos.map((p) => p.id)
          );

        if (!errorItems && items && items.length > 0) {
          // Canastas (una por pedido), sin productos eliminados
          const canastasMap = new Map();
          for (const item of items) {
            if (!idsValidos.has(item.producto_id)) continue;
            if (!canastasMap.has(item.pedido_id)) {
              canastasMap.set(item.pedido_id, new Set());
            }
            canastasMap.get(item.pedido_id).add(item.producto_id);
          }
          const canastas = [...canastasMap.values()].map((s) => [...s]);

          if (canastas.length > 0) {
            const reglas = generarReglasPipeline(
              canastas,
              SOPORT_MINIMO,
              CONFIANZA_MINIMA
            );

            // Buscar recomendaciones para el carrito actual
            const recomendados = new Map(); // producto_id -> mejor confianza

            if (cartSet.size > 0) {
              for (const { antecedente, consecuente, confianza } of reglas) {
                const antecedenteEnCarrito = antecedente.every((id) =>
                  cartSet.has(id)
                );
                const consecuenteFuera = consecuente.every(
                  (id) => !cartSet.has(id)
                );
                if (antecedenteEnCarrito && consecuenteFuera) {
                  for (const id of consecuente) {
                    const prev = recomendados.get(id) || 0;
                    if (confianza > prev) recomendados.set(id, confianza);
                  }
                }
              }
            }

            const idsRecomendados = [...recomendados.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([id]) => id);

            recomendaciones = idsRecomendados
              .map((id) => productosMap.get(id))
              .filter(Boolean)
              .slice(0, 3);
          }
        }
      }
    } catch (err) {
      // Si falla la lectura de pedidos, seguimos al fallback
      console.error('Error leyendo pedidos:', err);
      recomendaciones = [];
    }

    // ── 3. Fallback por categoría si las reglas no dieron resultado ───────
    let fallback = false;
    if (recomendaciones.length === 0 && cartSet.size > 0) {
      fallback = true;
      const categoriasCarrito = new Set(
        [...cartSet]
          .map((id) => productosMap.get(id)?.categoria)
          .filter(Boolean)
      );
      recomendaciones = productos.filter(
        (p) => !cartSet.has(p.id) && categoriasCarrito.has(p.categoria)
      );
    }

    // ── 4. Último recurso: cualquier producto fuera del carrito ───────────
    if (recomendaciones.length === 0 && cartSet.size > 0) {
      fallback = true;
      recomendaciones = productos.filter((p) => !cartSet.has(p.id));
    }

    // Limitar a 6 y serializar
    const respuesta = recomendaciones.slice(0, 3).map(toResponse);

    return res.status(200).json({ recomendaciones: respuesta, fallback });
  } catch (error) {
    console.error('Error recomendaciones:', error);
    return res.status(500).json({
      error: error.message || 'Error al generar recomendaciones',
    });
  }
}

function toResponse(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    categoria: p.categoria,
    imagen: p.imagen,
    detalles: p.detalles,
    stock: p.stock,
  };
}

// =====================================================
// Algoritmo — port directo del código Python
// =====================================================

/** Soporte: proporción de canastas que contienen el itemset */
function soporte(itemset, canastas) {
  const cuenta = canastas.filter((compra) =>
    itemset.every((id) => compra.includes(id))
  ).length;
  return cuenta / canastas.length;
}

/** Filtra combinaciones con soporte insuficiente */
function filtrarInservibles(combinacionesMap, soporteMinimo, canastas) {
  const filtrados = {};
  for (const [key, cantidad] of Object.entries(combinacionesMap)) {
    const ids = JSON.parse(key);
    if (soporte(ids, canastas) >= soporteMinimo) {
      filtrados[key] = cantidad;
    }
  }
  return filtrados;
}

/** Genera reglas antecedente → consecuente con confianza mínima */
function generarReglas(comprasFiltradas, confianzaMinima, canastas) {
  const reglas = [];
  for (const itemsetKey of Object.keys(comprasFiltradas)) {
    const itemset = JSON.parse(itemsetKey);
    if (itemset.length <= 1) continue;

    for (const producto of itemset) {
      const antecedente = itemset.filter((id) => id !== producto);
      const consecuente = [producto];
      const soporteAntecedente = soporte(antecedente, canastas);
      if (soporteAntecedente > 0) {
        const confianza = soporte(itemset, canastas) / soporteAntecedente;
        if (confianza >= confianzaMinima) {
          reglas.push({ antecedente, consecuente, confianza });
        }
      }
    }
  }
  return reglas;
}

/**
 * Pipeline completo (equivale al script Python):
 * 1. Generar combinaciones de tamaño 1..n
 * 2. Filtrar por soporte mínimo
 * 3. Generar reglas con confianza mínima
 */
function generarReglasPipeline(canastas, soporteMinimo, confianzaMinima) {
  const compraMayor = Math.max(...canastas.map((c) => c.length));
  const combinacionesMap = {};

  for (let i = 1; i <= compraMayor; i++) {
    for (const compra of canastas) {
      const unicos = [...new Set(compra)];
      for (const combo of combinations(unicos, i)) {
        const key = JSON.stringify([...combo].sort((a, b) => a - b));
        combinacionesMap[key] = (combinacionesMap[key] || 0) + 1;
      }
    }
  }

  const filtradas = filtrarInservibles(combinacionesMap, soporteMinimo, canastas);
  return generarReglas(filtradas, confianzaMinima, canastas);
}
