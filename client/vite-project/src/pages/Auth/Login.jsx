import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateEmail } from '../../utils/helper';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    return '';
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });
    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: '' },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormState((prev) => ({ ...prev, loading: true, errors: {} }));
    try {
      const { data } = await axios.post(
        '/api/auth/login',
        { email: formData.email, password: formData.password,rememberMe:formData.rememberMe},
        { withCredentials: true }
      );
      if (!data.success) {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          errors: { submit: data.message || 'Login failed. Please check your credentials.' },
        }));
        return;
      }
      setFormState((prev) => ({ ...prev, loading: false, success: true }));
      const role = data.user?.role;
      setTimeout(() => {
        navigate(role === 'employer' ? '/employer-dashboard' : '/find-jobs');
      }, 1500);
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            'Login failed. Please check your credentials.',
        },
      }));
    }
  };


  if (formState.success) {
    return (
      <div style={styles.page}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={styles.successCard}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={styles.successIcon}
          >
            <CheckCircle size={40} color="#fff" />
          </motion.div>
          <h2 style={styles.successTitle}>You&apos;re in!</h2>
          <p style={styles.successSub}>Redirecting to your dashboard…</p>
          <div style={styles.successSpinner}>
            <div style={styles.spinnerRing} />
          </div>
        </motion.div>
      </div>
    );
  }


  return (
    <div style={styles.page}>

      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      <div style={styles.card}>


 
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={styles.rightPanel}
        >
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrap}>
                <Mail size={17} style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your mail"
                  style={{
                    ...styles.input,
                    ...(formState.errors.email ? styles.inputError : styles.inputNormal),
                  }}
                />
              </div>
              <AnimatePresence>
                {formState.errors.email && (
                  <motion.p
                    key="email-err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={styles.errorMsg}
                  >
                    <AlertCircle size={13} />
                    {formState.errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

          
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={17} style={styles.inputIcon} />
                <input
                  type={formState.showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    ...styles.input,
                    paddingRight: '44px',
                    ...(formState.errors.password ? styles.inputError : styles.inputNormal),
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                  }
                  style={styles.toggleBtn}
                >
                  {formState.showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <AnimatePresence>
                {formState.errors.password && (
                  <motion.p
                    key="pw-err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={styles.errorMsg}
                  >
                    <AlertCircle size={13} />
                    {formState.errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div style={styles.rememberRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

          
            <AnimatePresence>
              {formState.errors.submit && (
                <motion.div
                  key="submit-err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.errorBanner}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{formState.errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

   
            <motion.button
              type="submit"
              disabled={formState.loading}
              whileHover={!formState.loading ? { scale: 1.02 } : {}}
              whileTap={!formState.loading ? { scale: 0.98 } : {}}
              style={{
                ...styles.submitBtn,
                opacity: formState.loading ? 0.7 : 1,
                cursor: formState.loading ? 'not-allowed' : 'pointer',
              }}
            >
              {formState.loading ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p style={styles.signupPrompt}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={styles.signupLink}>
              Create Here
            </Link>
          </p>
        </motion.div>
      </div>

 
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ringAnim {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};


const PURPLE = '#7c3aed';
const BLUE = '#2563eb';
const GRAD = `linear-gradient(135deg, ${PURPLE} 0%, ${BLUE} 100%)`;

const styles = {

  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    fontFamily: "'Inter', sans-serif",
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },


  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.25,
    pointerEvents: 'none',
  },
  blob1: {
    width: 420,
    height: 420,
    background: PURPLE,
    top: '-120px',
    left: '-100px',
  },
  blob2: {
    width: 360,
    height: 360,
    background: BLUE,
    bottom: '-100px',
    right: '-80px',
  },


  card: {
    display: 'flex',
    width: '100%',
    maxWidth: 500,
    minHeight: 500,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.14)',
    position: 'relative',
    zIndex: 1,
  },




  rightPanel: {
    flex: '1 1 58%',
    background: '#ffffff',
    padding: '52px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formHeader: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 6px',
    letterSpacing: '-0.4px',
    textAlign:'center'
  },
  formSub: {
    color: '#64748b',
    fontSize: 14,
    margin: 0,
    textAlign:'center'
  },


  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    letterSpacing: '0.1px',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    fontSize: 14,
    borderRadius: 12,
    border: '1.5px solid',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    fontFamily: "'Inter', sans-serif",
    color: '#0f172a',
    background: '#f8fafc',
    boxSizing: 'border-box',
  },
  inputNormal: {
    borderColor: '#e2e8f0',
    boxShadow: 'none',
  },
  inputError: {
    borderColor: '#f87171',
    boxShadow: '0 0 0 3px rgba(248,113,113,0.15)',
    background: '#fff5f5',
  },
  toggleBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },
  errorMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 500,
    margin: 0,
  },


  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#4b5563',
    cursor: 'pointer',
    fontWeight: 500,
    userSelect: 'none',
  },
  checkbox: {
    accentColor: PURPLE,
    width: 15,
    height: 15,
    cursor: 'pointer',
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: 600,
    color: PURPLE,
    textDecoration: 'none',
  },


  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 10,
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    color: '#be123c',
    fontSize: 13,
    fontWeight: 500,
    overflow: 'hidden',
  },


  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '13px 20px',
    background: GRAD,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    borderRadius: 12,
    letterSpacing: '0.1px',
    boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
    transition: 'box-shadow 0.2s',
  },


  signupPrompt: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 24,
    fontWeight: 500,
  },
  signupLink: {
    color: PURPLE,
    fontWeight: 700,
    textDecoration: 'none',
  },


  successCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '56px 48px',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: GRAD,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 8px',
  },
  successSub: {
    color: '#64748b',
    fontSize: 14,
    margin: '0 0 28px',
  },
  successSpinner: {
    display: 'flex',
    justifyContent: 'center',
  },
  spinnerRing: {
    width: 28,
    height: 28,
    border: `3px solid ${PURPLE}22`,
    borderTop: `3px solid ${PURPLE}`,
    borderRadius: '50%',
    animation: 'ringAnim 0.8s linear infinite',
  },
};

export default Login;
