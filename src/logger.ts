export default {
  info(...args: any[]) {
    console.error("INFO", ...args);
  },

  debug(...args: any[]) {
    console.error("DEBUG", ...args);
  }
};
