import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Star } from 'lucide-react';
import styles from './Inicio.module.css';

export default function Inicio() {
  return (
    <main>
      {/* SECCIÓN HERO */}
      <section className={styles.hero}>
        <div className={styles.videoBackground}>
          {/* Imagen de alta calidad de un auto siendo detallado o un deportivo */}
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

      {/* SECCIÓN DE CARACTERÍSTICAS RÁPIDAS (Simple y limpia) */}
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
    </main>
  );
}