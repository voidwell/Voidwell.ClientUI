module.exports = {
  '/api/*': {
    target: 'https://localdev.com',
    changeOrigin: true
  }
};
