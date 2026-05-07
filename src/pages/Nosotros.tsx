import { Target, Eye } from 'lucide-react';
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
          <p className="leading-relaxed">Proporcionar accesorios de alta calidad para cada entusiasta.</p>
        </div>

        <div className={`${styles.card} ${styles.visionCard} group`}>
          <div className={`${styles.iconBox} bg-slate-800 group-hover:bg-blue-500`}>
            <Eye className="text-white" />
          </div>
          <h3 className="text-3xl font-black mb-4 uppercase italic">Visión</h3>
          <p className="leading-relaxed">Ser el referente número uno en Detailing para 2030.</p>
        </div>
      </div>
    </div>
  );
}