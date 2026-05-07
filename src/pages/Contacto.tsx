import React, { useState } from 'react';
import { Mail, Phone, Send, MessageSquare, Clock } from 'lucide-react';
import styles from './Contacto.module.css'; // <--- IMPORTANTE

export default function Contacto() {
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 5000);
  };

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h2 className={styles.titulo}>
          Hablemos de tu <span className={styles.textoAzul}>Proyecto</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto font-light text-lg">
          ¿Tienes dudas sobre un accesorio o necesitas asesoría técnica?
        </p>
      </section>

      <div className={styles.gridContacto}>
        {/* Info Izquierda */}
        <div className="space-y-8">
          <h3 className="text-3xl font-black uppercase text-slate-900">Contacto Directo</h3>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Phone /></div>
            <p className="text-gray-500 font-bold">+52 55 1234 5678</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Mail /></div>
            <p className="text-gray-500 font-bold">soporte@carshop.com</p>
          </div>
        </div>

        {/* Formulario Derecha */}
        <div className={styles.formularioCard}>
          {enviado ? (
            <div className="text-center py-10">
              <h3 className="text-2xl font-black text-green-600">¡ENVIADO!</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nombre Completo</label>
                <input type="text" className={styles.inputField} placeholder="Tu nombre" required />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" className={styles.inputField} placeholder="correo@ejemplo.com" required />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Mensaje</label>
                <textarea className={styles.inputField} rows={4} placeholder="¿En qué podemos ayudarte?" required></textarea>
              </div>

              <button type="submit" className={styles.botonEnviar}>
                Enviar Mensaje <MessageSquare size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}