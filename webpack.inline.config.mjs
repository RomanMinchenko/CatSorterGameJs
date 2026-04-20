import fs from "fs";
import path from "path";

import HtmlWebpackPlugin from "html-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

const inlineCss = fs.readFileSync(path.resolve(process.cwd(), "public/style.css"), "utf8");
const inlineCssDataUri = `data:text/css;base64,${Buffer.from(inlineCss).toString("base64")}`;
const faviconBuffer = fs.readFileSync(path.resolve(process.cwd(), "public/favicon.png"));
const inlineFavicon = `data:image/png;base64,${faviconBuffer.toString("base64")}`;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const inlineJavaScriptIntoHtml = (outputPath) => {
  const htmlPath = path.join(outputPath, "index.html");

  if (!fs.existsSync(htmlPath)) {
    return;
  }

  let htmlSource = fs.readFileSync(htmlPath, "utf8");
  const jsAssets = fs
    .readdirSync(outputPath)
    .filter((fileName) => fileName.endsWith(".js"));

  jsAssets.forEach((fileName) => {
    const jsPath = path.join(outputPath, fileName);
    const jsSource = fs.readFileSync(jsPath, "utf8");
    const jsDataUri = `data:text/javascript;base64,${Buffer.from(jsSource).toString("base64")}`;
    const srcAttributeRegex = new RegExp(`src=["'][^"']*${escapeRegExp(fileName)}[^"']*["']`, "g");

    htmlSource = htmlSource.replace(srcAttributeRegex, `src="${jsDataUri}"`);
    fs.rmSync(jsPath, { force: true });
  });

  fs.readdirSync(outputPath)
    .filter((fileName) => fileName.endsWith(".LICENSE.txt"))
    .forEach((fileName) => {
      fs.rmSync(path.join(outputPath, fileName), { force: true });
    });

  fs.writeFileSync(htmlPath, htmlSource, "utf8");
};

export default {
  stats: "minimal",
  entry: "./src/main.js",

  output: {
    path: path.resolve(process.cwd(), "dist-inline"),
    filename: "bundle.js",
    clean: true,
  },

  performance: { hints: false },
  devtool: undefined,

  optimization: {
    minimize: true,
    splitChunks: false,
    runtimeChunk: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: { drop_console: true },
          output: { comments: false, beautify: false },
        },
      }),
    ],
  },

  module: {
    rules: [],
    parser: {
      javascript: {
        dynamicImportMode: "eager",
      },
    },
  },

  resolve: {
    extensions: [".js", ".jsx"],
  },

  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /manifest\.json$/,
      path.resolve(process.cwd(), "src/manifest.inline.generated.js"),
    ),
    new HtmlWebpackPlugin({
      template: "./index.inline.ejs",
      minify: true,
      inject: "body",
      inlineCssDataUri,
      inlineFavicon,
    }),
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tap("InlineJavaScriptIntoHtmlPlugin", (compilation) => {
          inlineJavaScriptIntoHtml(compilation.outputOptions.path);
        });
      },
    },
  ],
};
