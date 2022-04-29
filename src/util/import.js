// This file ensures interOp between CJS and ESM in Node and allows scripts.config.js to be ESM.
// It must be copied into `dist` until `module: node12` is supported in stable Typescript.
// See https://github.com/microsoft/TypeScript/issues/43329

module.exports = {
    __esModule: true,
    default: (s) => import(s),
}
