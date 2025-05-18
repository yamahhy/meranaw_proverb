const path = require("path");

module.exports = {
  mode: "development", // or 'production'
  entry: "./main/index.js", // ← adjust to wherever your main file is
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  // you can add loaders/plugins here as needed
};
