import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Upload,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


const PURPLE = '#7c3aed';
const BLUE = '#2563eb';
const GRAD = `linear-gradient(135deg, ${PURPLE} 0%, ${BLUE} 100%)`;


const validateEmail = (v) => {
  if (!v) return 'Email is required';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address';
};

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    avatar: null,
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    avatarPreview: null,
    success: false,
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formState.errors[name]) {
      setFormState((prev) => ({ ...prev, errors: { ...prev.errors, [name]: '' } }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (formState.errors.role) {
      setFormState((prev) => ({ ...prev, errors: { ...prev.errors, role: '' } }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormState((prev) => ({ ...prev, errors: { ...prev.errors, avatar: 'File must be under 5 MB' } }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormState((prev) => ({ ...prev, avatarPreview: reader.result, errors: { ...prev.errors, avatar: '' } }));
    reader.readAsDataURL(file);
    setFormData((prev) => ({ ...prev, avatar: file }));
  };


  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.role) errors.role = 'Please select a role';
    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormState((prev) => ({ ...prev, loading: true, errors: {} }));
    try {
      const { data } = await axios.post(
        '/api/auth/register',
        { name: formData.name, email: formData.email, password: formData.password, role: formData.role  },
        { withCredentials: true }
      );

      if (!data.success) {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          errors: { submit: data.message || 'Registration failed. Please try again.' },
        }));
        return;
      }
      setFormState((prev) => ({ ...prev, loading: false, success: true }));
      setTimeout(() => navigate(formData.role === 'employer' ? '/employer-dashboard' : '/find-jobs'), 1500);
    } catch (err) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: { submit: err.response?.data?.message || 'Registration failed. Please try again.' },
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
          <h2 style={styles.successTitle}>Account Created!</h2>
          <p style={styles.successSub}>Welcome to KaamSathi. Redirecting to your dashboard…</p>
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

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={styles.card}
      >
        {/* header */}
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>Create Account</h2>
          <p style={styles.formSub}>Join thousands of professionals finding their dream jobs</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>


          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}>
              <User size={17} style={styles.inputIcon} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  ...styles.input,
                  ...(formState.errors.fullName ? styles.inputError : styles.inputNormal),
                }}
              />
            </div>
            <AnimatePresence>
              {formState.errors.name && (
                <motion.p key="fn-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>


          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <Mail size={17} style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{
                  ...styles.input,
                  ...(formState.errors.email ? styles.inputError : styles.inputNormal),
                }}
              />
            </div>
            <AnimatePresence>
              {formState.errors.email && (
                <motion.p key="em-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={17} style={styles.inputIcon} />
              <input
                type={formState.showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                style={{
                  ...styles.input,
                  paddingRight: '44px',
                  ...(formState.errors.password ? styles.inputError : styles.inputNormal),
                }}
              />
              <button
                type="button"
                onClick={() => setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                style={styles.toggleBtn}
              >
                {formState.showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <AnimatePresence>
              {formState.errors.password && (
                <motion.p key="pw-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Role selector */}
          <div style={styles.field}>
            <label style={styles.label}>I am a…</label>
            <div style={styles.roleRow}>
              {[
                { value: 'jobseeker', label: 'Job Seeker', icon: <UserCheck size={17} /> },
                { value: 'employer', label: 'Employer', icon: <Building2 size={17} /> },
              ].map(({ value, label, icon }) => {
                const active = formData.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRoleChange(value)}
                    style={{
                      ...styles.roleBtn,
                      ...(active ? styles.roleBtnActive : styles.roleBtnInactive),
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {formState.errors.role && (
                <motion.p key="role-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.role}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar upload */}
          <div style={styles.field}>
            <label style={styles.label}>Profile Picture <span style={styles.optional}>(optional)</span></label>
            <div style={styles.avatarRow}>
              <div style={styles.avatarCircle}>
                {formState.avatarPreview ? (
                  <img src={formState.avatarPreview} alt="Avatar preview" style={styles.avatarImg} />
                ) : (
                  <User size={32} color="#9ca3af" />
                )}
              </div>
              <div style={styles.avatarMeta}>
                <input
                  type="file"
                  name="avatar"
                  id="avatar-upload"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload" style={styles.uploadBtn}>
                  <Upload size={15} />
                  Upload Photo
                </label>
                <p style={styles.uploadHint}>JPG, PNG · max 5 MB</p>
              </div>
            </div>
            <AnimatePresence>
              {formState.errors.avatar && (
                <motion.p key="av-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.avatar}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit error banner */}
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

          {/* Submit button */}
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
                Creating account…
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <p style={styles.loginPrompt}>
          Already have an account?{' '}
          <Link to="/login" style={styles.loginLink}>Sign In</Link>
        </p>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ringAnim { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};


const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    fontFamily: "'Inter', sans-serif",
    padding: '32px 16px',
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
  blob1: { width: 420, height: 420, background: PURPLE, top: '-120px', left: '-100px' },
  blob2: { width: 360, height: 360, background: BLUE, bottom: '-100px', right: '-80px' },

  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.14)',
    background: '#ffffff',
    padding: '48px 44px',
    position: 'relative',
    zIndex: 1,
  },

  formHeader: { marginBottom: 32, textAlign: 'center' },
  formTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 6px',
    letterSpacing: '-0.4px',
  },
  formSub: { color: '#64748b', fontSize: 14, margin: 0 },

  form: { display: 'flex', flexDirection: 'column', gap: 20 },

  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', letterSpacing: '0.1px' },
  optional: { fontWeight: 400, color: '#9ca3af' },

  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, color: '#9ca3af', pointerEvents: 'none' },

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
  inputNormal: { borderColor: '#e2e8f0', boxShadow: 'none' },
  inputError: { borderColor: '#f87171', boxShadow: '0 0 0 3px rgba(248,113,113,0.15)', background: '#fff5f5' },

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

  /* role selector */
  roleRow: { display: 'flex', gap: 12 },
  roleBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 16px',
    borderRadius: 12,
    border: '1.5px solid',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s',
    fontFamily: "'Inter', sans-serif",
  },
  roleBtnActive: { background: GRAD, color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' },
  roleBtnInactive: { background: '#f8fafc', color: '#374151', borderColor: '#e2e8f0' },


  avatarRow: { display: 'flex', alignItems: 'center', gap: 20 },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: '50%',
    background: '#f1f5f9',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarMeta: { display: 'flex', flexDirection: 'column', gap: 6 },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 18px',
    background: GRAD,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 10,
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 12px rgba(124,58,237,0.28)',
    transition: 'opacity 0.18s',
    fontFamily: "'Inter', sans-serif",
  },
  uploadHint: { color: '#9ca3af', fontSize: 12, margin: 0 },


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
    fontFamily: "'Inter', sans-serif",
  },


  loginPrompt: { textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 24, fontWeight: 500 },
  loginLink: { color: PURPLE, fontWeight: 700, textDecoration: 'none' },


  successCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '56px 48px',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
    position: 'relative',
    zIndex: 1,
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
  successTitle: { fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' },
  successSub: { color: '#64748b', fontSize: 14, margin: '0 0 28px' },
  successSpinner: { display: 'flex', justifyContent: 'center' },
  spinnerRing: {
    width: 28,
    height: 28,
    border: `3px solid ${PURPLE}22`,
    borderTop: `3px solid ${PURPLE}`,
    borderRadius: '50%',
    animation: 'ringAnim 0.8s linear infinite',
  },
};

export default SignUp;
