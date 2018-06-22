// eslint-disable-next-line import/no-extraneous-dependencies
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// eslint-disable-next-line import/no-extraneous-dependencies
const CompressionPlugin = require('compression-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies

module.exports = {
  lintOnSave: false,
  chainWebpack: (config) => {
    const isProd = config.get('mode') === 'production';

    const deleteSourceMaps = isProd;
    const analyzeBundle = false;
    const compress = isProd;

    config.when(deleteSourceMaps, c => c.delete('devtool'));

    config.when(analyzeBundle, c => c.plugin('analyzer')
      .use(BundleAnalyzerPlugin));

    config.when(compress, c => c.plugin('compress')
      .use(CompressionPlugin));
  }
};
