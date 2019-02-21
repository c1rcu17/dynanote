/* eslint no-param-reassign: 0 */
/* eslint import/no-extraneous-dependencies: 0 */
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const RemoveSourceWebpackPlugin = require('remove-source-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');

// const dump = (obj, label) => {
//   console.log('\n');
//   if (label) {
//     console.log(`------ ${label} ------`);
//   }
//   // eslint-disable-next-line global-require
//   console.log(require('util').inspect(obj, {
//     showHidden: false,
//     depth: 4
//   }));
// };

const configureNotesBundle = (config) => {
  const isProd = config.get('mode') === 'production';
  const entry = 'note-skel';

  const exclude = [new RegExp(`${entry}.*\\.js`)];

  config.optimization.delete('splitChunks');

  config.entry(entry)
    .add('./src/components/renderer/note-skel.styl')
    .end();

  const htmlOpts = Object.assign(config.plugin('html').get('args')[0], {
    excludeChunks: [entry]
  });

  config.plugin('note-html')
    .use(HtmlWebpackPlugin, [{
      template: resolve(__dirname, 'src/components/renderer/note-skel.html'),
      filename: 'note-skel.html',
      minify: htmlOpts.minify,
      chunks: [entry],
      excludeAssets: exclude
    }]);

  config.when(isProd, (c) => {
    c.plugin('exclude-assets')
      .use(HtmlWebpackExcludeAssetsPlugin);

    c.plugin('remove-source')
      .use(RemoveSourceWebpackPlugin, exclude);
  });
};

module.exports = {
  publicPath: '/dynanote',
  lintOnSave: false,
  chainWebpack: (config) => {
    const isProd = config.get('mode') === 'production';

    const deleteSourceMaps = isProd;
    const analyzeBundle = false;
    const gzip = isProd;
    const brotli = isProd;

    configureNotesBundle(config);

    config.when(deleteSourceMaps, c => c.delete('devtool'));

    config.when(analyzeBundle, c => c.plugin('analyzer')
      .use(BundleAnalyzerPlugin));

    config.when(gzip, c => c.plugin('gzip')
      .use(CompressionPlugin));

    config.when(brotli, c => c.plugin('brotli')
      .use(BrotliPlugin));
  }
};
