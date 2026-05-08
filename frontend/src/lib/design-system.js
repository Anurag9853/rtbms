// ─── Framer Motion Shared Variants ─────────────────────────────────────────

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const drawerVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const rightDrawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 500, damping: 35 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const countUpConfig = {
  from: { number: 0 },
  to: { number: 1 },
  config: { tension: 120, friction: 40 },
};

// ─── Design Tokens (mirroring Tailwind config for JS use) ──────────────────

export const colors = {
  crimson: '#c0392b',
  crimsonLight: '#e74c3c',
  electric: '#2563eb',
  electricLight: '#3b82f6',
  base900: '#0f0f14',
  base800: '#16161e',
  base700: '#222230',
  base600: '#333340',
  available: '#22c55e',
  low: '#f59e0b',
  critical: '#ef4444',
  white: '#fafafa',
  muted: '#6b6b80',
};

export const spacing = {
  unit: 8,
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem',      // 48px
  xxl: '4rem',     // 64px
  xxxl: '6rem',    // 96px
};

// ─── Blood Group Config ────────────────────────────────────────────────────

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BLOOD_GROUP_COLORS = {
  'A+':  { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#ef4444' },
  'A-':  { bg: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.3)',  text: '#dc2626' },
  'B+':  { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', text: '#f97316' },
  'B-':  { bg: 'rgba(234,88,12,0.15)',  border: 'rgba(234,88,12,0.3)',  text: '#ea580c' },
  'O+':  { bg: 'rgba(37,99,235,0.15)',  border: 'rgba(37,99,235,0.3)',  text: '#2563eb' },
  'O-':  { bg: 'rgba(79,70,229,0.15)',  border: 'rgba(79,70,229,0.3)',  text: '#4f46e5' },
  'AB+': { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  'AB-': { bg: 'rgba(5,150,105,0.15)',  border: 'rgba(5,150,105,0.3)',  text: '#059669' },
};

export const URGENCY_CONFIG = {
  critical: { label: 'Critical',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)' },
  high:     { label: 'High',      color: '#f97316', bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)' },
  medium:   { label: 'Medium',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)' },
  routine:  { label: 'Routine',   color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)' },
};

export const ROLES = {
  admin:      'admin',
  donor:      'donor',
  blood_bank: 'blood_bank',
  hospital:   'hospital',
};

// ─── API Base URL ──────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
