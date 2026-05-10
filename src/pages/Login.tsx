import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!captchaToken) {
      setError("Por favor completa el captcha");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (error) {
      setError("Credenciales incorrectas");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <LogIn size={32} />
          </div>
          <h2 className={styles.title}>Acceso</h2>
          <p className={styles.subtitle}>CarShop System</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Corporativo</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                type="email"
                required
                className={styles.input}
                placeholder="nombre@carshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={styles.input}
                placeholder="••••••••"
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

          {/* Captcha */}
          <div className={styles.captchaWrapper}>
            <HCaptcha
              sitekey="3eca6aee-36fc-489a-aef8-6284d716c49e"
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              ref={captchaRef}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className={styles.submitButton}
          >
            {loading ? "Verificando..." : (
              <>
                Entrar al Sistema
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            ¿Eres nuevo cliente?
          </p>
          <Link
            to="/register"
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tighter"
          >
            <UserPlus size={16} />
            Crear una cuenta nueva
          </Link>
        </div>

        <p className={styles.footerNote}>
          Uso exclusivo para personal autorizado
        </p>
      </div>
    </div>
  );
};

export default Login;