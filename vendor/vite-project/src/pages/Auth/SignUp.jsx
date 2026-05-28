import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
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
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';


const PURPLE = '#f59e0b';
const BLUE = '#f97316';
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
      const { data } = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (!data.success) {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          errors: { submit: data.message || 'Registration failed. Please try again.' },
        }));
        return;
      }
      setFormState((prev) => ({ ...prev, loading: false, success: true }));
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`), 1200);
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
        <div style={{ ...styles.blob, ...styles.blob1 }} />
        <div style={{ ...styles.blob, ...styles.blob2 }} />
        <Motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={styles.successCard}
        >
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={styles.successIcon}
          >
            <CheckCircle size={40} color="#fff" />
          </Motion.div>
          <h2 style={styles.successTitle}>Account Created!</h2>
          <p style={styles.successSub}>Please verify your email with OTP to continue.</p>
          <div style={styles.successSpinner}>
            <div style={styles.spinnerRing} />
          </div>
        </Motion.div>
      </div>
    );
  }


  return (
    <div style={styles.page}>
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={styles.card}
      >
        {/* header */}
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>Create Account</h2>
          <p style={styles.formSub}>Join as a customer or vendor to manage stays and bookings</p>
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
                <Motion.p key="fn-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.name}
                </Motion.p>
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
                <Motion.p key="em-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.email}
                </Motion.p>
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
                <Motion.p key="pw-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.password}
                </Motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Role selector */}
          <div style={styles.field}>
            <label style={styles.label}>I am a…</label>
            <div style={styles.roleRow}>
              {[
                { value: 'customer', label: 'Customer', icon: <UserCheck size={17} /> },
                { value: 'vendor', label: 'Vendor', icon: <Building2 size={17} /> },
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
                <Motion.p key="role-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.role}
                </Motion.p>
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
                <Motion.p key="av-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                  <AlertCircle size={13} /> {formState.errors.avatar}
                </Motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit error banner */}
          <AnimatePresence>
            {formState.errors.submit && (
              <Motion.div
                key="submit-err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={styles.errorBanner}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{formState.errors.submit}</span>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <Motion.button
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
          </Motion.button>
        </form>

        <p style={styles.loginPrompt}>
          Already have an account?{' '}
          <Link to="/login" style={styles.loginLink}>Sign In</Link>
        </p>
        <p style={styles.verifyPrompt}>
          Already registered but not verified?{' '}
          <Link to="/verify-email" style={styles.verifyLink}>Verify Email</Link>
        </p>
      </Motion.div>

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
    background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 42%, #020617 100%)',
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
  blob1: { width: 420, height: 420, background: 'rgba(251, 146, 60, 0.18)', top: '-140px', left: '-120px' },
  blob2: { width: 360, height: 360, background: 'rgba(56, 189, 248, 0.12)', bottom: '-120px', right: '-100px' },

  card: {
    width: '100%',
    maxWidth: 620,
    borderRadius: 32,
    overflow: 'hidden',
    boxShadow: '0 32px 90px rgba(0,0,0,0.45)',
    background: 'rgba(15, 23, 42, 0.88)',
    padding: '56px 52px',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(255,255,255,0.08)',
  },

  formHeader: { marginBottom: 32, textAlign: 'center' },
  formTitle: {
    fontSize: 42,
    fontWeight: 800,
    color: '#f8fafc',
    margin: '0 0 6px',
    letterSpacing: '-1px',
  },
  formSub: { color: '#cbd5e1', fontSize: 18, margin: 0, fontWeight: 600 },

  form: { display: 'flex', flexDirection: 'column', gap: 20 },

  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.08em', textTransform: 'uppercase' },
  optional: { fontWeight: 500, color: '#94a3b8' },

  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, color: '#f59e0b', pointerEvents: 'none' },

  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    fontSize: 14,
    borderRadius: 14,
    border: '1.5px solid',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    fontFamily: "'Inter', sans-serif",
    color: '#f8fafc',
    background: 'rgba(51, 65, 85, 0.82)',
    boxSizing: 'border-box',
  },
  inputNormal: { borderColor: 'rgba(148, 163, 184, 0.24)', boxShadow: 'none' },
  inputError: { borderColor: '#f87171', boxShadow: '0 0 0 3px rgba(248,113,113,0.15)', background: 'rgba(127, 29, 29, 0.25)' },

  toggleBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },

  errorMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: '#fb7185',
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
    borderRadius: 14,
    border: '1.5px solid',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s',
    fontFamily: "'Inter', sans-serif",
  },
  roleBtnActive: { background: GRAD, color: '#fff', borderColor: 'transparent', boxShadow: '0 14px 30px rgba(249,115,22,0.24)' },
  roleBtnInactive: { background: 'rgba(51, 65, 85, 0.7)', color: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.24)' },


  avatarRow: { display: 'flex', alignItems: 'center', gap: 20 },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: '50%',
    background: 'rgba(51, 65, 85, 0.72)',
    border: '2px solid rgba(148, 163, 184, 0.22)',
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
    boxShadow: '0 14px 30px rgba(249,115,22,0.24)',
    transition: 'opacity 0.18s',
    fontFamily: "'Inter', sans-serif",
  },
  uploadHint: { color: '#94a3b8', fontSize: 12, margin: 0 },


  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 10,
    background: 'rgba(127, 29, 29, 0.35)',
    border: '1px solid rgba(248, 113, 113, 0.35)',
    color: '#fecaca',
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
    borderRadius: 14,
    letterSpacing: '0.1px',
    boxShadow: '0 14px 34px rgba(249,115,22,0.28)',
    transition: 'box-shadow 0.2s',
    fontFamily: "'Inter', sans-serif",
  },


  loginPrompt: { textAlign: 'center', fontSize: 13, color: '#cbd5e1', marginTop: 24, fontWeight: 500 },
  loginLink: { color: '#f59e0b', fontWeight: 700, textDecoration: 'none' },
  verifyPrompt: { textAlign: 'center', fontSize: 12.5, color: '#94a3b8', marginTop: 8, fontWeight: 500 },
  verifyLink: { color: '#f59e0b', fontWeight: 700, textDecoration: 'none' },


  successCard: {
    background: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    padding: '56px 48px',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(255,255,255,0.08)',
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
    boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
  },
  successTitle: { fontSize: 26, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' },
  successSub: { color: '#cbd5e1', fontSize: 14, margin: '0 0 28px' },
  successSpinner: { display: 'flex', justifyContent: 'center' },
  spinnerRing: {
    width: 28,
    height: 28,
    border: `3px solid rgba(249,115,22,0.18)`,
    borderTop: `3px solid ${BLUE}`,
    borderRadius: '50%',
    animation: 'ringAnim 0.8s linear infinite',
  },
};

export default SignUp;
