import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const PURPLE = '#f59e0b';
const BLUE = '#f97316';
const GRAD = `linear-gradient(135deg, ${PURPLE} 0%, ${BLUE} 100%)`;

const ForgotPassword = () => {
  const navigate = useNavigate();

  // step: 'email' | 'reset' | 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ─── Step 1: Send Reset OTP ─────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address';
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setErrors({});
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.SEND_RESET_OTP, { email });
      if (!data.success) {
        setErrors({ submit: data.message || 'Failed to send OTP. Please try again.' });
      } else {
        setStep('reset');
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step 2: Reset Password ─────────────────────────────── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!otp || otp.length !== 6) errs.otp = 'Enter the 6-digit OTP';
    if (!newPassword) errs.newPassword = 'New password is required';
    else if (newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setErrors({});
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });
      if (!data.success) {
        setErrors({ submit: data.message || 'Failed to reset password. Please try again.' });
      } else {
        setStep('success');
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to reset password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  
  if (step === 'success') {
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
          <h2 style={styles.successTitle}>Password Reset!</h2>
          <p style={styles.successSub}>
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            style={styles.submitBtn}
          >
            Back to Login
            <ArrowRight size={18} />
          </Motion.button>
        </Motion.div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      <Motion.div
        key={step}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={styles.card}
      >
        {/* Header */}
        <div style={styles.formHeader}>
          <div style={styles.iconBadge}>
            <KeyRound size={26} color="#fff" />
          </div>
          <h2 style={styles.formTitle}>
            {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p style={styles.formSub}>
            {step === 'email'
              ? 'Enter your email address and we\'ll send you a reset OTP.'
              : `Enter the OTP sent to ${email} and set your new password.`}
          </p>
        </div>

        {/* Step indicator */}
        <div style={styles.stepRow}>
          {['email', 'reset'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                style={{
                  ...styles.stepDot,
                  background:
                    step === s
                      ? GRAD
                      : i < ['email', 'reset'].indexOf(step)
                      ? PURPLE
                      : '#e2e8f0',
                }}
              >
                {i < ['email', 'reset'].indexOf(step) ? (
                  <CheckCircle size={12} color="#fff" />
                ) : (
                  <span style={{ color: step === s ? '#fff' : '#9ca3af', fontSize: 11, fontWeight: 700 }}>
                    {i + 1}
                  </span>
                )}
              </div>
              {i < 1 && <div style={{ ...styles.stepLine, background: i < ['email', 'reset'].indexOf(step) ? PURPLE : '#e2e8f0' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} style={styles.form} noValidate>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={17} style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  placeholder="Enter your registered email"
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : styles.inputNormal),
                  }}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <Motion.p
                    key="email-err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={styles.errorMsg}
                  >
                    <AlertCircle size={13} />
                    {errors.email}
                  </Motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {errors.submit && (
                <Motion.div
                  key="submit-err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.errorBanner}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errors.submit}</span>
                </Motion.div>
              )}
            </AnimatePresence>

            <Motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Sending OTP…
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={18} />
                </>
              )}
            </Motion.button>
          </form>
        )}

        {/* ── STEP 2: OTP + New Password ── */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} style={styles.form} noValidate>
            {/* OTP field */}
            <div style={styles.field}>
              <label style={styles.label}>OTP Code</label>
              <div style={styles.inputWrap}>
                <KeyRound size={17} style={styles.inputIcon} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    if (errors.otp) setErrors((p) => ({ ...p, otp: '' }));
                  }}
                  placeholder="Enter 6-digit OTP"
                  style={{
                    ...styles.input,
                    letterSpacing: '4px',
                    ...(errors.otp ? styles.inputError : styles.inputNormal),
                  }}
                />
              </div>
              <AnimatePresence>
                {errors.otp && (
                  <Motion.p key="otp-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                    <AlertCircle size={13} />{errors.otp}
                  </Motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* New password */}
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrap}>
                <Lock size={17} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' }));
                  }}
                  placeholder="Minimum 6 characters"
                  style={{
                    ...styles.input,
                    paddingRight: '44px',
                    ...(errors.newPassword ? styles.inputError : styles.inputNormal),
                  }}
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} style={styles.toggleBtn}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.newPassword && (
                  <Motion.p key="np-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                    <AlertCircle size={13} />{errors.newPassword}
                  </Motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm password */}
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrap}>
                <Lock size={17} style={styles.inputIcon} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  placeholder="Repeat new password"
                  style={{
                    ...styles.input,
                    paddingRight: '44px',
                    ...(errors.confirmPassword ? styles.inputError : styles.inputNormal),
                  }}
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)} style={styles.toggleBtn}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <Motion.p key="cp-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorMsg}>
                    <AlertCircle size={13} />{errors.confirmPassword}
                  </Motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {errors.submit && (
                <Motion.div
                  key="submit-err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.errorBanner}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errors.submit}</span>
                </Motion.div>
              )}
            </AnimatePresence>

            <Motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Resetting…
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight size={18} />
                </>
              )}
            </Motion.button>

            <button
              type="button"
              onClick={() => { setStep('email'); setErrors({}); setOtp(''); setNewPassword(''); setConfirmPassword(''); }}
              style={styles.backBtn}
            >
              <ArrowLeft size={14} /> Back to email
            </button>
          </form>
        )}

        <p style={styles.signupPrompt}>
          Remembered your password?{' '}
          <Link to="/login" style={styles.signupLink}>Sign In</Link>
        </p>
      </Motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
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
  blob1: { width: 420, height: 420, background: 'rgba(251, 146, 60, 0.18)', top: '-140px', left: '-120px' },
  blob2: { width: 360, height: 360, background: 'rgba(56, 189, 248, 0.12)', bottom: '-120px', right: '-100px' },
  card: {
    background: '#ffffff',
    borderRadius: 32,
    padding: '56px 52px',
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 32px 90px rgba(0,0,0,0.45)',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(15, 23, 42, 0.88)',
    position: 'relative',
    zIndex: 1,
  },
  formHeader: { marginBottom: 28, textAlign: 'center' },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${PURPLE} 0%, ${BLUE} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
  },
  formTitle: { fontSize: 40, fontWeight: 800, color: '#f8fafc', margin: '0 0 6px', letterSpacing: '-1px' },
  formSub: { color: '#cbd5e1', fontSize: 16, margin: 0, lineHeight: 1.5, fontWeight: 600 },
  stepRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 },
  stepDot: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.3s',
  },
  stepLine: { width: 48, height: 2, transition: 'background 0.3s' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.08em', textTransform: 'uppercase' },
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
  toggleBtn: { position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: 4 },
  errorMsg: { display: 'flex', alignItems: 'center', gap: 5, color: '#fb7185', fontSize: 12, fontWeight: 500, margin: 0 },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
    background: 'rgba(127, 29, 29, 0.35)', border: '1px solid rgba(248, 113, 113, 0.35)', color: '#fecaca', fontSize: 13, fontWeight: 500, overflow: 'hidden',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '13px 20px', background: `linear-gradient(135deg, ${PURPLE} 0%, ${BLUE} 100%)`,
    color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 12,
    letterSpacing: '0.1px', boxShadow: '0 14px 34px rgba(249,115,22,0.28)', transition: 'box-shadow 0.2s', cursor: 'pointer',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: 'none', border: 'none', color: '#cbd5e1', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', padding: '6px 0', margin: '0 auto',
  },
  signupPrompt: { textAlign: 'center', fontSize: 13, color: '#cbd5e1', marginTop: 24, fontWeight: 500 },
  signupLink: { color: '#f59e0b', fontWeight: 700, textDecoration: 'none' },
  successCard: {
    background: 'rgba(15, 23, 42, 0.9)', borderRadius: 24, padding: '56px 44px', maxWidth: 420, width: '100%',
    textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', position: 'relative', zIndex: 1,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  successIcon: {
    width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${PURPLE} 0%, ${BLUE} 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
  },
  successTitle: { fontSize: 26, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' },
  successSub: { color: '#cbd5e1', fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 },
};

export default ForgotPassword;
