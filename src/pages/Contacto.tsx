import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import emailjs from '@emailjs/browser';
import styles from './Contacto.module.css';

export default function Contacto() {
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

    try {
      await emailjs.send(
        'carshop_service',
        'f0iuhlb',
        {
          from_name: form.nombre,
          from_email: form.email,
          message: form.mensaje,
        },
        'mVFQNrK28-RUKheoR'
      );
      setEnviado(true);
      setForm({ nombre: '', email: '', mensaje: '' });
      setTimeout(() => setEnviado(false), 5000);
    } catch (err) {
      setError('Hubo un error al enviar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
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

        <div className={styles.formularioCard}>
          {enviado ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-black text-green-600">¡MENSAJE ENVIADO!</h3>
              <p className="text-gray-500 mt-2">Te responderemos pronto.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={styles.inputField}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.inputField}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Mensaje</label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  className={styles.inputField}
                  rows={4}
                  placeholder="¿En qué podemos ayudarte?"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                className={styles.botonEnviar}
              >
                {enviando ? 'Enviando...' : 'Enviar Mensaje'} 💬
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}