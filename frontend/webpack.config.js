const path = require("path");

const HtmlWebPackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const htmlPlugin = new HtmlWebPackPlugin({
  template: path.join(__dirname, "/src/index.html")
});
const extractPlugin = new ExtractTextPlugin("styles.css");

module.exports = {
  entry: path.join(__dirname, "./src/index.js"),
  output: {
    path: path.resolve("dist"),
    filename: "main.js"
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader"]
        })
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.join(__dirname, "/src/index.html")
    }),
    new ExtractTextPlugin("styles.css")
  ]
};
