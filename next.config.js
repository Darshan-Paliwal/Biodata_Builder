// next.config.js
module.exports = {
  webpack: (config) => {
    // Exclude 'neon' to avoid build issues from unrecognized extension
    config.externals = [...(config.externals || []), 'neon'];
    return config;
  },
};