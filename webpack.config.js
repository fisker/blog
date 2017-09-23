const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlMinifyLoader = require('html-minify-loader')
const PrepackWebpackPlugin = require('prepack-webpack-plugin').default
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')

const path = require('path')

module.exports = {
  entry: ['./src/app.js'],
  output: {
    path: __dirname + '/dist',
    // filename: 'app-[hash].js'
    filename: '[name].js'
  },
  devServer: {
    // contentBase:'./build',
    contentBase: path.join(__dirname, 'dist'),
    host: 'localhost',
    inline: true,
    port: 3000,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: ['style-loader', 'css-loader', 'autoprefixer-loader', 'sass-loader']
      },
      //8 编译es6
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
          // ,"minify"
        }
      },
      //8 编译es6
      {
        test: '/.html$/',
        use: {
            loader: 'html-loader',
            options: {
              minimize: true,
              removeComments: false,
              collapseWhitespace: false
            }
        }
      }
    ]
  },
  //4 配置HTML模板插件
  // 这样 webpack 编译的时候回自动在output目录下生成index.html
  plugins: [
    new HtmlWebpackPlugin({
      config: require('./blog-config.js'),
      // 4.2 输出后html的名字，可以自定义
      filename: 'index.html',
      //4.3 html的模板,也可以是xxx.html
      template: 'src/index.html'
    }),
    //7 代码优化：合并以及压缩代码
    // 开发环境暂时不需要
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  ]
}
