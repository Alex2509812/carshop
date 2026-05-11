import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Star } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import styles from './Inicio.module.css';

const mapContainerStyle = {
  width: '100%',
  height: '450px',
};

const center = {
  lat: 23.6345,
  lng: -102.5528,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  ],
};

function MapaCarShop() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-100 rounded-2xl">
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
          Error al cargar el mapa
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-100 rounded-2xl animate-pulse">
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
          Cargando mapa...
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={5}
      options={mapOptions}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}

export default function Inicio() {
  return (
    <main>
      {/* SECCIÓN HERO */}
      <section className={styles.hero}>
        <div className={styles.videoBackground}>
          <img
            src="https://images.unsplash.com/photo-1542362567-b05503f3f7f4?auto=format&fit=crop&q=80"
            alt="Car Detail"
          />
        </div>

        <div className={styles.content}>
          <span className={styles.badge}>Estándar Profesional</span>
          <h1 className={styles.titulo}>
            Pasión por la <br />
            <span className={styles.italic}>Perfección</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg font-light">
            Especialistas en accesorios de alta gama y productos de detallado que devuelven el brillo de exhibición a tu vehículo.
          </p>

          <div className={styles.ctaGrid}>
            <Link to="/catalogo" className={styles.btnPrimary}>
              Ver Catálogo
            </Link>
            <Link to="/nosotros" className={styles.btnSecondary}>
              Nuestra Misión
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS RÁPIDAS */}
      <section className="py-20 bg-white px-8 border-b">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <Zap className="text-blue-600 mb-4 w-10 h-10" />
            <h4 className="font-black uppercase text-sm tracking-widest mb-2">Performance</h4>
            <p className="text-gray-500 text-xs px-8">Alerones y vinilos diseñados para mejorar la aerodinámica y estética.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="text-blue-600 mb-4 w-10 h-10" />
            <h4 className="font-black uppercase text-sm tracking-widest mb-2">Protección</h4>
            <p className="text-gray-500 text-xs px-8">Químicos de grado profesional que protegen la pintura de los elementos.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Star className="text-blue-600 mb-4 w-10 h-10" />
            <h4 className="font-black uppercase text-sm tracking-widest mb-2">Exclusividad</h4>
            <p className="text-gray-500 text-xs px-8">Productos seleccionados cuidadosamente para los entusiastas más exigentes.</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN MAPA */}
      <section className="py-20 bg-slate-50 px-8 border-b">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">
              Cobertura
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
              Dónde Estamos
            </h2>
            <p className="text-gray-500 text-sm mt-3 font-light">
              Llevamos nuestros productos a todo México.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <MapaCarShop />
          </div>
        </div>
      </section>
    </main>
  );
}
