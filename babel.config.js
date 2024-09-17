// babel.config.js
module.exports = {
  presets: [
    "@babel/preset-env", // For transforming modern JavaScript
    ["@babel/preset-react", { "runtime": "automatic" }],
    "@babel/preset-typescript", // For transforming TypeScript
  ],
};
