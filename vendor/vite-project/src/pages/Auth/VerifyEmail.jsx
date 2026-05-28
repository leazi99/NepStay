import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ShieldCheck,
  KeyRound,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const PURPLE = '#f59e0b';
const BLUE = '#f97316';
const GRAD = `linear-gradient(135deg, ${PURPLE} 0%, ${BLUE} 100%)`;
const RESEND_COOLDOWN = 60;
const MotionDiv = Motion.div;
const MotionButton = Motion.button;
const MotionP = Motion.p;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((count) => count - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
    return '';
  };

  const handleSendOtp = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setSendLoading(true);
    setErrors({});

    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.SEND_VERIFY_OTP, { email });

      if (!data.success) {
        setErrors({ send: data.message || 'Failed to send OTP. Please try again.' });
      } else {
        setOtpSent(true);
        setCooldown(RESEND_COOLDOWN);
      }
    } catch (error) {
      setErrors({ send: error.response?.data?.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const validationErrors = {};
    const emailError = validateEmail(email);
    if (emailError) validationErrors.email = emailError;
    if (!otp || otp.length !== 6) validationErrors.otp = 'Enter the 6-digit OTP';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setVerifyLoading(true);
    setErrors({});

    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.VERIFY_ACCOUNT, { email, otp });

      if (!data.success) {
        setErrors({ otp: data.message || 'Invalid or expired OTP.' });
      } else {
        setVerified(true);
      }
    } catch (error) {
      setErrors({ otp: error.response?.data?.message || 'Verification failed. Please try again.' });
    } finally {
      setVerifyLoading(false);
    }
  };

  if (verified) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.blob, ...styles.blob1 }} />
        <div style={{ ...styles.blob, ...styles.blob2 }} />
        <MotionDiv
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={styles.card}
        >
          <MotionDiv
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={styles.successIcon}
          >
            <CheckCircle size={36} color="#fff" />
          </MotionDiv>
          <h2 style={styles.formTitle}>Email Verified!</h2>
          <p style={{ ...styles.formSub, marginBottom: 28 }}>
            Your email <strong>{email}</strong> has been successfully verified.
          </p>
          <MotionButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            style={styles.submitBtn}
          >
            Continue to Login <ArrowRight size={18} />
          </MotionButton>
        </MotionDiv>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      <MotionDiv
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={styles.card}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={styles.iconBadge}>
            <Mail size={26} color="#fff" />
          </div>
          <h2 style={styles.formTitle}>Verify Your Email</h2>
          <p style={styles.formSub}>
            Enter your email and the 6-digit OTP sent to your inbox.
          </p>
        </div>

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <Mail size={17} style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="Enter your email"
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : styles.inputNormal),
                }}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <MotionP
                  key="email-err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={styles.errorMsg}
                >
                  <AlertCircle size={13} />
                  {errors.email}
                </MotionP>
              )}
            </AnimatePresence>
          </div>

          {!otpSent ? (
            <>
              <AnimatePresence>
                {errors.send && (
                  <MotionDiv
                    key="send-err"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={styles.errorBanner}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{errors.send}</span>
                  </MotionDiv>
                )}
              </AnimatePresence>

              <MotionButton
                disabled={sendLoading}
                whileHover={!sendLoading ? { scale: 1.02 } : {}}
                whileTap={!sendLoading ? { scale: 0.98 } : {}}
                onClick={handleSendOtp}
                style={{
                  ...styles.submitBtn,
                  opacity: sendLoading ? 0.7 : 1,
                  cursor: sendLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {sendLoading ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Sending OTP…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Send Verification OTP
                  </>
                )}
              </MotionButton>
            </>
          ) : (
            <form onSubmit={handleVerify} style={styles.form} noValidate>
              <div style={styles.field}>
                <label style={styles.label}>Verification OTP</label>
                <div style={styles.inputWrap}>
                  <KeyRound size={17} style={styles.inputIcon} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => {
                      setOtp(event.target.value.replace(/\D/g, ''));
                      if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                    }}
                    placeholder="Enter 6-digit OTP"
                    autoFocus
                    style={{
                      ...styles.input,
                      letterSpacing: '6px',
                      textAlign: 'center',
                      fontSize: 18,
                      fontWeight: 700,
                      ...(errors.otp ? styles.inputError : styles.inputNormal),
                    }}
                  />
                </div>
                <AnimatePresence>
                  {errors.otp && (
                    <MotionP
                      key="otp-err"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={styles.errorMsg}
                    >
                      <AlertCircle size={13} />
                      {errors.otp}
                    </MotionP>
                  )}
                </AnimatePresence>
              </div>

              <MotionButton
                type="submit"
                disabled={verifyLoading}
                whileHover={!verifyLoading ? { scale: 1.02 } : {}}
                whileTap={!verifyLoading ? { scale: 0.98 } : {}}
                style={{
                  ...styles.submitBtn,
                  opacity: verifyLoading ? 0.7 : 1,
                  cursor: verifyLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {verifyLoading ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify Email
                  </>
                )}
              </MotionButton>

              <div style={{ textAlign: 'center', marginTop: 4 }}>
                {cooldown > 0 ? (
                  <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>
                    Resend OTP in <strong style={{ color: PURPLE }}>{cooldown}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={sendLoading}
                    onClick={handleSendOtp}
                    style={styles.resendBtn}
                  >
                    <RefreshCw size={13} />
                    {sendLoading ? 'Sending…' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <p style={styles.signupPrompt}>
          Already verified?{' '}
          <Link to="/login" style={styles.signupLink}>Go to Login</Link>
        </p>
      </MotionDiv>

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
  blob: { position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25, pointerEvents: 'none' },
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
  iconBadge: {
    width: 56, height: 56, borderRadius: '50%',
    background: GRAD,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 6px 20px rgba(249,115,22,0.35)',
  },
  successIcon: {
    width: 72, height: 72, borderRadius: '50%', background: GRAD,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
  },
  formTitle: { fontSize: 40, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', letterSpacing: '-1px', textAlign: 'center' },
  formSub: { color: '#cbd5e1', fontSize: 16, margin: 0, lineHeight: 1.6, textAlign: 'center', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.08em', textTransform: 'uppercase' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, color: '#f59e0b', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '13px 14px 13px 42px', fontSize: 14, borderRadius: 14,
    border: '1.5px solid', outline: 'none', transition: 'border-color 0.18s, box-shadow 0.18s',
    fontFamily: "'Inter', sans-serif", color: '#f8fafc', background: 'rgba(51, 65, 85, 0.82)', boxSizing: 'border-box',
  },
  inputNormal: { borderColor: 'rgba(148, 163, 184, 0.24)', boxShadow: 'none' },
  inputError: { borderColor: '#f87171', boxShadow: '0 0 0 3px rgba(248,113,113,0.15)', background: 'rgba(127, 29, 29, 0.25)' },
  errorMsg: { display: 'flex', alignItems: 'center', gap: 5, color: '#fb7185', fontSize: 12, fontWeight: 500, margin: 0 },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
    background: 'rgba(127, 29, 29, 0.35)', border: '1px solid rgba(248, 113, 113, 0.35)', color: '#fecaca', fontSize: 13, fontWeight: 500, overflow: 'hidden',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '13px 20px', background: GRAD, color: '#fff',
    fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 12,
    letterSpacing: '0.1px', boxShadow: '0 14px 34px rgba(249,115,22,0.28)',
    transition: 'box-shadow 0.2s', cursor: 'pointer',
  },
  resendBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none',
    border: 'none', color: '#f59e0b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    padding: '4px 8px', borderRadius: 6,
  },
  signupPrompt: { textAlign: 'center', fontSize: 13, color: '#cbd5e1', marginTop: 24, fontWeight: 500 },
  signupLink: { color: '#f59e0b', fontWeight: 700, textDecoration: 'none' },
};

export default VerifyEmail;
