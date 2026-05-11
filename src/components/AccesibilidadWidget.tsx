import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Accessibility,
  X,
  Eye,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Type,
  SkipForward,
  Contrast,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────
interface AccesibilidadState {
  escalaDeGrises: boolean;
  modoNocturno: boolean;
  lecturaVoz: boolean;
  tamanoTexto: number;         // 100 | 150 | 200
  lecturaGuiada: boolean;
  navegacionTeclado: boolean;
}

const ESTADO_INICIAL: AccesibilidadState = {
  escalaDeGrises: false,
  modoNocturno: false,
  lecturaVoz: false,
  tamanoTexto: 100,
  lecturaGuiada: false,
  navegacionTeclado: false,
};

const STORAGE_KEY = 'carshop-accesibilidad';

// ─── Helpers ────────────────────────────────────────────────────────────────
function cargarEstado(): AccesibilidadState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...ESTADO_INICIAL, ...JSON.parse(raw) };
  } catch (_) {}
  return ESTADO_INICIAL;
}

function guardarEstado(estado: AccesibilidadState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (_) {}
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function AccesibilidadWidget() {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState<AccesibilidadState>(cargarEstado);
  const [leyendo, setLeyendo] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Botón con foco para teclado
  const botonRef = useRef<HTMLButtonElement>(null);

  // ── Aplicar estilos globales ─────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;

    // Escala de grises
    root.style.filter = estado.escalaDeGrises ? 'grayscale(100%)' : '';

    // Modo nocturno via clase CSS en <html>
    root.classList.toggle('modo-nocturno', estado.modoNocturno);

    // Tamaño de texto
    root.style.fontSize = `${estado.tamanoTexto}%`;

    // Navegación por teclado – clase para mostrar outlines
    root.classList.toggle('nav-teclado', estado.navegacionTeclado);

    // Lectura guiada
    root.classList.toggle('lectura-guiada', estado.lecturaGuiada);

    guardarEstado(estado);
  }, [estado]);

  // ── Cleanup TTS al desmontar ─────────────────────────────────────────────
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  // ── Cerrar con Escape ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) setAbierto(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [abierto]);

  // ── Actualizar una propiedad ─────────────────────────────────────────────
  const toggle = useCallback(
    (key: keyof AccesibilidadState) =>
      setEstado((prev) => ({ ...prev, [key]: !prev[key] })),
    []
  );

  // ── Texto a voz ─────────────────────────────────────────────────────────
  const toggleVoz = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura por voz.');
      return;
    }

    if (leyendo) {
      window.speechSynthesis.cancel();
      setLeyendo(false);
      setEstado((prev) => ({ ...prev, lecturaVoz: false }));
      return;
    }

    const texto = document.querySelector('main')?.innerText
      ?? document.body.innerText;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.onend = () => {
      setLeyendo(false);
      setEstado((prev) => ({ ...prev, lecturaVoz: false }));
    };
    utterance.onerror = () => {
      setLeyendo(false);
      setEstado((prev) => ({ ...prev, lecturaVoz: false }));
    };

    window.speechSynthesis.speak(utterance);
    setLeyendo(true);
    setEstado((prev) => ({ ...prev, lecturaVoz: true }));
  }, [leyendo]);

  // ── Tamaño de texto ──────────────────────────────────────────────────────
  const cambiarTexto = useCallback((delta: number) => {
    setEstado((prev) => ({
      ...prev,
      tamanoTexto: Math.min(200, Math.max(80, prev.tamanoTexto + delta)),
    }));
  }, []);

  // ── Saltar al contenido ──────────────────────────────────────────────────
  const saltarContenido = useCallback(() => {
    const main = document.querySelector('main, #contenido-principal') as HTMLElement | null;
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // ── Restablecer todo ─────────────────────────────────────────────────────
  const restablecer = useCallback(() => {
    window.speechSynthesis?.cancel();
    setLeyendo(false);
    setEstado(ESTADO_INICIAL);
  }, []);

  // ─── Opciones del panel ──────────────────────────────────────────────────
  const opciones = [
    {
      label: 'Texto alternativo',
      desc: 'Mejora descripciones para lectores de pantalla',
      icono: <Type size={18} />,
      activo: false,          // El texto alt ya existe en los img, solo informativo
      accion: () => {},
      solo_info: true,
    },
    {
      label: 'Escala de grises',
      desc: 'Convierte los colores a escala de grises',
      icono: <Contrast size={18} />,
      activo: estado.escalaDeGrises,
      accion: () => toggle('escalaDeGrises'),
    },
    {
      label: estado.modoNocturno ? 'Modo diurno' : 'Modo nocturno',
      desc: 'Reduce el brillo y protege tus ojos',
      icono: estado.modoNocturno ? <Sun size={18} /> : <Moon size={18} />,
      activo: estado.modoNocturno,
      accion: () => toggle('modoNocturno'),
    },
    {
      label: estado.lecturaVoz ? 'Detener lectura' : 'Lectura por voz',
      desc: 'Lee el contenido de la página en voz alta',
      icono: leyendo ? <VolumeX size={18} /> : <Volume2 size={18} />,
      activo: leyendo,
      accion: toggleVoz,
    },
    {
      label: 'Lectura guiada',
      desc: 'Resalta el párrafo al pasar el cursor',
      icono: <BookOpen size={18} />,
      activo: estado.lecturaGuiada,
      accion: () => toggle('lecturaGuiada'),
    },
    {
      label: 'Navegación por teclado',
      desc: 'Muestra el foco visible al navegar con Tab',
      icono: <Eye size={18} />,
      activo: estado.navegacionTeclado,
      accion: () => toggle('navegacionTeclado'),
    },
    {
      label: 'Saltar al contenido',
      desc: 'Salta directamente al contenido principal',
      icono: <SkipForward size={18} />,
      activo: false,
      accion: saltarContenido,
      es_accion: true,
    },
  ];

  return (
    <>
      {/* ── Estilos globales inyectados ──────────────────────────────── */}
      <style>{`
        /* Modo nocturno */
        .modo-nocturno {
          background-color: #0f0f0f !important;
          color: #e2e8f0 !important;
        }
        .modo-nocturno nav,
        .modo-nocturno footer {
          background-color: #1a1a1a !important;
          border-color: #333 !important;
        }
        .modo-nocturno .bg-white {
          background-color: #1e1e1e !important;
        }
        .modo-nocturno .bg-slate-50 {
          background-color: #111 !important;
        }
        .modo-nocturno .text-slate-900,
        .modo-nocturno .text-gray-900 {
          color: #e2e8f0 !important;
        }
        .modo-nocturno .text-gray-500,
        .modo-nocturno .text-slate-500 {
          color: #94a3b8 !important;
        }
        .modo-nocturno .border-slate-100 {
          border-color: #2d2d2d !important;
        }
        .modo-nocturno .bg-slate-100 {
          background-color: #2d2d2d !important;
        }
        .modo-nocturno input,
        .modo-nocturno textarea {
          background-color: #2a2a2a !important;
          color: #e2e8f0 !important;
          border-color: #444 !important;
        }

        /* Navegación por teclado */
        .nav-teclado *:focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 3px !important;
          border-radius: 4px !important;
        }

        /* Lectura guiada */
        .lectura-guiada p:hover,
        .lectura-guiada li:hover,
        .lectura-guiada h1:hover,
        .lectura-guiada h2:hover,
        .lectura-guiada h3:hover {
          background-color: rgba(37, 99, 235, 0.08) !important;
          border-radius: 4px;
          cursor: default;
          transition: background 0.2s;
        }

        /* Widget panel */
        .acc-panel {
          font-size: 1rem !important;
        }
      `}</style>

      {/* ── Botón flotante ───────────────────────────────────────────── */}
      <button
        ref={botonRef}
        onClick={() => setAbierto((v) => !v)}
        aria-label="Abrir menú de accesibilidad"
        aria-expanded={abierto}
        aria-haspopup="dialog"
        className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-300 flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400"
        style={{ fontSize: '1rem' }}   // reset para que el widget no herede escala
      >
        <Accessibility size={24} />
      </button>

      {/* ── Panel lateral ────────────────────────────────────────────── */}
      {abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panel de accesibilidad"
          ref={panelRef}
          className="acc-panel fixed bottom-24 left-6 z-[9998] w-80 bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden"
          style={{ fontSize: '1rem' }}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Accessibility size={18} />
              <span className="font-black uppercase tracking-widest text-xs">Accesibilidad</span>
            </div>
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú de accesibilidad"
              className="hover:text-blue-400 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tamaño de texto */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
              Tamaño de texto — {estado.tamanoTexto}%
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => cambiarTexto(-10)}
                disabled={estado.tamanoTexto <= 80}
                aria-label="Reducir tamaño de texto"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition disabled:opacity-30 text-xs font-bold"
              >
                <ZoomOut size={14} /> A–
              </button>

              <div className="flex gap-1">
                {[100, 150, 200].map((v) => (
                  <button
                    key={v}
                    onClick={() => setEstado((p) => ({ ...p, tamanoTexto: v }))}
                    aria-label={`Texto al ${v}%`}
                    aria-pressed={estado.tamanoTexto === v}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition ${
                      estado.tamanoTexto === v
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cambiarTexto(10)}
                disabled={estado.tamanoTexto >= 200}
                aria-label="Aumentar tamaño de texto"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition disabled:opacity-30 text-xs font-bold"
              >
                <ZoomIn size={14} /> A+
              </button>
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {opciones.map((op) => (
              <button
                key={op.label}
                onClick={op.accion}
                aria-pressed={op.es_accion ? undefined : op.activo}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all group ${
                  op.activo
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'bg-white hover:bg-slate-50'
                } ${op.solo_info ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
              >
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    op.activo
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}
                >
                  {op.icono}
                </span>
                <div>
                  <p className={`text-xs font-bold ${op.activo ? 'text-blue-700' : 'text-slate-800'}`}>
                    {op.label}
                    {op.solo_info && (
                      <span className="ml-2 text-[9px] font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Activo
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{op.desc}</p>
                </div>
                {op.activo && !op.es_accion && (
                  <span className="ml-auto flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Pie – restablecer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">CarShop © 2026</span>
            <button
              onClick={restablecer}
              aria-label="Restablecer configuración de accesibilidad"
              className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 hover:text-red-700 transition uppercase tracking-wider"
            >
              <RotateCcw size={12} />
              Restablecer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
