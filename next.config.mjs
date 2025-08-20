// next.config.js
module.exports = {
  webpack: (config) => {
    // Exclude 'neon' to prevent build issues if it's an unrecognized dependency
    config.externals = [...(config.externals || []), 'neon'];
    return config;
  },
};