const tsconfigRaw = require('../../tsconfig.json');

// this one compiles all the js and ts files (and jsx and tsx),
// while generating also type definition (d.ts)
// and mapping for the ts and tsX files (only)
// const tsJsRule = {
//     test: /\.(js|ts|jsx|tsx)$/,
//     exclude: /node_modules/,
//     loader: 'ts-loader',
// };

const tsJsRule = {
    test: /\.(js|ts|jsx|tsx)$/,
    loader: 'esbuild-loader',
    options: {
        loader: 'tsx',
        target: 'es2015',
        tsconfigRaw,
    },
};

// it generates source map files for the js and jsx files
const jsSrcMapRule = {
    test: /\.js$/,
    enforce: 'pre',
    exclude: /node_modules/,
    use: ['source-map-loader'],
};

module.exports = {
    tsJsRule,
    jsSrcMapRule,
};
