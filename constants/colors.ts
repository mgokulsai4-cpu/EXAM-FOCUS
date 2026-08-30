export const COLORS = {
  background: '#03060a',
  backgroundSecondary: '#0a111e',
  backgroundTertiary: '#101824',
  surface: '#172030',
  surfaceHover: '#1e293b',
  
  primary: '#0ea5e9',
  primaryLight: '#38bdf8',
  primaryDark: '#0284c7',
  primaryGlow: 'rgba(14, 165, 233, 0.4)',
  
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  secondaryGlow: 'rgba(139, 92, 246, 0.4)',
  
  accent: {
    cyan: '#00fff5',
    neonBlue: '#00d4ff',
    violet: '#b300ff',
    purple: '#8b5cf6',
    pink: '#ec4899',
    green: '#22c55e',
    emerald: '#10b981',
    amber: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
    rose: '#f43f5e',
  },
  
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
    focus: '#0ea5e9',
    ai: '#8b5cf6',
    reward: '#f59e0b',
    blocked: '#ef4444',
  },
  
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    tertiary: '#64748b',
    inverse: '#03060a',
    muted: '#475569',
  },
  
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    heavy: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHighlight: 'rgba(255, 255, 255, 0.2)',
  },
  
  gradients: {
    primary: ['#0ea5e9', '#8b5cf6'],
    secondary: ['#8b5cf6', '#ec4899'],
    cyan: ['#00d4ff', '#00fff5'],
    violet: ['#8b5cf6', '#b300ff'],
    green: ['#22c55e', '#10b981'],
    amber: ['#f59e0b', '#f97316'],
    red: ['#ef4444', '#f43f5e'],
    dark: ['#03060a', '#0a111e'],
    glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)'],
    orb: ['#00d4ff', '#8b5cf6', '#b300ff'],
    fire: ['#ef4444', '#f97316', '#f59e0b'],
    ocean: ['#0ea5e9', '#06b6d4', '#00d4ff'],
    sunset: ['#f97316', '#ec4899', '#8b5cf6'],
  },
  
  subjectColors: {
    java: { primary: '#ef4444', secondary: '#f97316', gradient: ['#ef4444', '#f97316'] },
    python: { primary: '#0ea5e9', secondary: '#8b5cf6', gradient: ['#0ea5e9', '#8b5cf6'] },
    javascript: { primary: '#f59e0b', secondary: '#ef4444', gradient: ['#f59e0b', '#ef4444'] },
    cpp: { primary: '#22c55e', secondary: '#0ea5e9', gradient: ['#22c55e', '#0ea5e9'] },
    datastructures: { primary: '#8b5cf6', secondary: '#ec4899', gradient: ['#8b5cf6', '#ec4899'] },
    algorithms: { primary: '#ec4899', secondary: '#8b5cf6', gradient: ['#ec4899', '#8b5cf6'] },
    databases: { primary: '#06b6d4', secondary: '#0ea5e9', gradient: ['#06b6d4', '#0ea5e9'] },
    networking: { primary: '#f97316', secondary: '#f59e0b', gradient: ['#f97316', '#f59e0b'] },
    operating_systems: { primary: '#22c55e', secondary: '#10b981', gradient: ['#22c55e', '#10b981'] },
    machine_learning: { primary: '#b300ff', secondary: '#8b5cf6', gradient: ['#b300ff', '#8b5cf6'] },
  },
  
  orbStates: {
    idle: ['#0ea5e9', '#8b5cf6'],
    studying: ['#00d4ff', '#00fff5'],
    focus: ['#22c55e', '#10b981'],
    reward: ['#f59e0b', '#f97316'],
    celebration: ['#ec4899', '#b300ff', '#00d4ff'],
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }),
  glowStrong: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  }),
};

export const TYPOGRAPHY = {
  fontSizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
    '6xl': 48,
    '7xl': 64,
    '8xl': 80,
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    loose: 2,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

export const ANIMATION_DURATION = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
  slowest: 1200,
};

export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
};

export const BREAKPOINTS = {
  sm: 375,
  md: 428,
  lg: 768,
  xl: 1024,
};