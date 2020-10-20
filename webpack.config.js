module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.js', 
  watch: true,
  watchOptions: {
    ignored: /node_modules/
  },
  output: {
    path: __dirname + '/dist',
    filename: 'main.js'
  }
};
