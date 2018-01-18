import { Config, ConfigOptions } from "karma";
import * as puppeteer from "puppeteer";

// Use local Chrome binary
process.env.CHROME_BIN = puppeteer.executablePath();

export default function(config: Config) {
  config.set({
    frameworks: ["mocha", "chai", "sinon", "karma-typescript"],
    files: ["test/**/*.ts", "src/**/*.ts"],
    reporters: ["mocha", "karma-typescript"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ["ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"]
      }
    },
    autoWatch: false,
    concurrency: Infinity,
    singleRun: false,
    preprocessors: {
      "**/*.ts": "karma-typescript"
    },
    mime: {
      "text/x-typescript": ["ts", "tsx"]
    },
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.json",
      include: ["test"],
      compilerOptions: {
        module: "commonjs",
        sourceMap: true,
        inlineSourceMap: false,
        types: ["node"]
      },
      bundlerOptions: {
        entrypoints: /.*\/test\/(?!helpers\/).*\.ts$/,
        sourceMap: true
      }
    }
  } as ExtendedConfigOptions);
}

interface ExtendedConfigOptions extends ConfigOptions {
  karmaTypescriptConfig: any;
}
