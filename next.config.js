// next.config.js
module.exports = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'neon']; // Exclude 'neon' to avoid issues
    return config;
  },
};