import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import uglify from "rollup-plugin-uglify";
import typescript from "rollup-plugin-typescript2";
import tsc from "typescript";

import * as pkg from "./package.json";

const environment = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase();
const isProduction = environment === "production";
const shouldUseSourceMaps = !isProduction;

const commonPlugins = [
  typescript({
    typescript: tsc,
    tsconfigOverride: {
      module: "es2015",
      inlineSourceMap: shouldUseSourceMaps,
      include: ["src"]
    }
  }),
  nodeResolve({ preferBuiltins: false }),
  commonjs(),
  globals(),
  builtins()
];

export default [
  {
    input: "./src/index.ts",
    output: [
      // Unminified ESM:
      {
        file: pkg.module,
        format: "es",
        sourcemap: shouldUseSourceMaps && "inline"
      },

      // Unminified UMD:
      {
        name: "Bambora",
        file: pkg.main,
        format: "umd",
        sourcemap: shouldUseSourceMaps && "inline"
      }
    ],
    plugins: commonPlugins
  },

  // Minified IIFE for CDN:
  {
    input: "./src/index.ts",
    output: {
      name: "Bambora",
      file: "dist/checkout-sdk-web.min.js",
      format: "iife"
    },
    plugins: [...commonPlugins, uglify()]
  }
];
