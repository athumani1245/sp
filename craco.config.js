module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        http: false,
        https: false,
        zlib: false,
        stream: false,
        url: false,
        assert: false,
        util: false,
      };
      return webpackConfig;
    },
  },
};
