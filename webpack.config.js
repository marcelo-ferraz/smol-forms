const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

const getTsandJsAliases = require('./config/getTsandJsAliases');
const paths = require('./config/paths');
const externalDependencies = require('./config/externalDependencies');

const {
    imagesRule,
    fontsRule,
    tsJsRule,
    jsSrcMapRule,
    getCssRules,
} = require('./config/rules');

module.exports = (env, argv = {}) => {
    const isProduction = argv.mode && argv.mode !== 'development';

    const [
        cssModulesRule,
        cssRule,
        thirdPartyCssRule,
    ] = getCssRules([paths.src], isProduction);

    return {
        entry: {
            index: './src/index',
            validators: './src/validators',
            parsers: './src/parsers',
            types: './src/types',
        },

        mode: argv.mode || 'development',

        context: paths.context,

        output: {
            path: paths.output,
            library: {
                name: 'smol-forms',
                type: 'umd',
            },
            clean: true,
        },

        module: {
            rules: [
                // compiles any of the js, jsx, ts, tsx
                // for ts: creates the types and map files
                tsJsRule,
                // creates the source maps for js files
                jsSrcMapRule,
                // any files named *.module.css or *.module.scss
                // will be compiled into css modules
                cssModulesRule,
                // transform the scss and css files and bundle them into css files
                cssRule,
                // extracts and bundle from node_modules css only files
                thirdPartyCssRule,
                // places the images on the proper folder and fix the urls
                imagesRule,
                // places the fonts on the proper folder and fix the urls
                fontsRule,
            ],
        },

        optimization: {
            splitChunks: {
                chunks: 'all',
            },
            minimize: false,
            minimizer: [
                // Use esbuild to minify
                new ESBuildMinifyPlugin(),
            ],
        },

        plugins: [
            new MiniCssExtractPlugin({
                linkType: 'text/css',
                filename: 'css/[name].css',
                chunkFilename: 'css/[name].chunk.css',
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: env.analyze ? 'server' : 'disabled',
            }),
        ],

        resolve: {
            extensions: ['', '.js', '.jsx', '.ts', '.tsx'],
            alias: getTsandJsAliases(),
        },

        externals: externalDependencies,
    };
};
