/**
 * Production-safe console wrapper
 * Automatically disables console.log in production builds
 * Use this instead of console.log for better production performance
 */

const isDev = __DEV__ || process.env.NODE_ENV === 'development';

export const productionConsole = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, even in production (but can be filtered)
    console.error(...args);
  },
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
};

export default productionConsole;

