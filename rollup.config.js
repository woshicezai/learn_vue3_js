import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import html from "@rollup/plugin-html";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import resolve from "@rollup/plugin-node-resolve";
import globals from "rollup-plugin-node-globals";

export default {
  input: "src/renderer/index.js",
  output: {
    file: "dist/renderer/bundle.js",
    format: "es",
    sourcemap: true,
  },
  watch: {
    include: "src/**",
  },
  plugins: [
    html({
      title: "My App",
      fileName: "index.html",
      publicPath: "./",
      template: ({ attributes, files, publicPath, title }) => {
        const scripts = (files.js || [])
          .map((file) => {
            return `<script type="module" src="${publicPath}${file.fileName}"></script>`;
          })
          .join("\n");
        // const links = (files.css || [])
        //   .map((file) => {
        //     return `<link rel="stylesheet" href="${publicPath}${file.fileName}">`;
        //   })
        //   .join("\n");
        return `<!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <script src="//localhost:35729/livereload.js"></script>
            ${scripts}
          </head>
          <body>
            <div id="app"></div>
          </body>
          </html>`;
      },
    }),
    resolve(),
    globals(),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "bundled",
    }),
    serve({
      contentBase: ["dist/renderer"],
      port: 8080,
    }),
    livereload(),
    terser(),
  ],
};
