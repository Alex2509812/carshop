import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import styles from './Register.module.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate('/login'), 5000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <UserPlus size={32} />
          </div>
          <h2 className={styles.title}>Crear Cuenta</h2>
        </div>

        {success ? (
          <div className={styles.successAlert}>
            <CheckCircle2 size={40} className="mx-auto mb-2" />
            <p>¡Registro exitoso!</p>
            <p className="font-normal mt-1 text-gray-500 italic">Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className={styles.form}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Correo Electrónico</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  required
                  className={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirmar Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  className={styles.input}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className={styles.eyeButton}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Procesando..." : "Registrarme"}
            </button>
          </form>
        )}

        <div className={styles.loginLink}>
          ¿Ya tienes cuenta? <span onClick={() => navigate('/login')}>Inicia Sesión</span>
        </div>
      </div>
    </div>
  );
};

export default Register;