import { Target, Eye, Star, BookOpen, Award } from 'lucide-react';
import styles from './Nosotros.module.css';

export default function Nosotros() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h2 className="text-5xl font-black uppercase tracking-tighter">Nuestra Identidad</h2>
      </section>

      <div className={styles.gridMision}>
        <div className={`${styles.card} ${styles.misionCard} group`}>
          <div className={`${styles.iconBox} bg-blue-600 group-hover:bg-white`}>
            <Target className="text-white group-hover:text-blue-600" />
          </div>
          <h3 className="text-3xl font-black mb-4 uppercase italic">Misión</h3>
          <p className="leading-relaxed">Empoderar a los entusiastas del detallado automotriz brindando acceso a productos de calidad y herramientas profesionales que transforman cada vehículo en una obra de arte.</p>
        </div>

        <div className={`${styles.card} ${styles.visionCard} group`}>
          <div className={`${styles.iconBox} bg-slate-800 group-hover:bg-blue-500`}>
            <Eye className="text-white" />
          </div>
          <h3 className="text-3xl font-black mb-4 uppercase italic">Visión</h3>
          <p className="leading-relaxed">Convertirnos en la plataforma líder de e-commerce en México para el cuidado automotriz, siendo reconocidos por nuestra curaduría de marcas premium y la excelencia técnica.</p>
        </div>
      </div>

      {/* Sección Valores */}
      <div className={styles.valoresSection}>
        <div className={styles.valoresHeader}>
          <span className={styles.valoresEmoji}>🛒</span>
          <h3 className="text-3xl font-black uppercase tracking-tight">Nuestros Valores</h3>
        </div>

        <div className={styles.valoresGrid}>
          <div className={styles.valorCard}>
            <div className={styles.valorIcon} style={{ background: '#eff6ff' }}>
              <Award className="text-blue-600 w-6 h-6" />
            </div>
            <h4 className="text-lg font-black uppercase mb-2">Calidad</h4>
            <p className="text-gray-500 text-sm leading-relaxed">Solo marcas probadas por expertos.</p>
          </div>

          <div className={styles.valorCard}>
            <div className={styles.valorIcon} style={{ background: '#fef2f2' }}>
              <Star className="text-red-500 w-6 h-6" />
            </div>
            <h4 className="text-lg font-black uppercase mb-2">Pasión</h4>
            <p className="text-gray-500 text-sm leading-relaxed">Por el brillo y la protección perfecta.</p>
          </div>

          <div className={styles.valorCard}>
            <div className={styles.valorIcon} style={{ background: '#f0fdf4' }}>
              <BookOpen className="text-green-600 w-6 h-6" />
            </div>
            <h4 className="text-lg font-black uppercase mb-2">Educación</h4>
            <p className="text-gray-500 text-sm leading-relaxed">No solo vendemos, damos calidad.</p>
          </div>
        </div>
      </div>
    </div>
  );
}