const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "./bundle.js",
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map"
});