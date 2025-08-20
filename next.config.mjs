// next.config.js
module.exports = {
  webpack: (config) => {
    // Exclude any potential external dependencies causing build issues
    config.externals = [...(config.externals || []), 'neon']; // Added as a precaution
    return config;
  },
};