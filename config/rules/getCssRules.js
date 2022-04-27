const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (paths, isProd = false) => {
    const sassLoader = {
        loader: 'sass-loader',
        options: {
            sourceMap: true,
            sassOptions: {
                includePaths: paths,
            },
        },
    };

    const styleOrCssLoader = !isProd
        ? { loader: 'style-loader' }
        : { loader: MiniCssExtractPlugin.loader };

    // for more info about the loader:
    // https://webpack.js.org/loaders/css-loader/
    const getCssLoader = (isForModules = false) => {
        const cssModuleCfg = {
            // namedExport: true,
            exportLocalsConvention: 'camelCaseOnly',
            localIdentName: isProd
                ? '[path][name]__[local]--[hash:base64:5]'
                : '[path][name]__[local]',
        };

        return ({
            loader: 'css-loader',
            options: {
                import: true,
                sourceMap: !isProd,
                modules: isForModules && cssModuleCfg,
                // 0 => no loaders (default);
                // 1 => postcss-loader;
                // 2 => postcss-loader, sass-loader
                importLoaders: 2,
            },
        });
    };

    return [
        // css modules
        {
            test: /\.module\.s?css$/,
            include: [paths],
            use: [
                styleOrCssLoader,
                getCssLoader(true),
                'postcss-loader',
                sassLoader,
            ],
        },
        // css
        {
            test: /\.s?css$/,
            include: [paths],
            exclude: [/\.module\.s?css$/],
            use: [
                styleOrCssLoader,
                getCssLoader(false),
                'postcss-loader',
                sassLoader,
            ],
        },
        // third party css
        {
            test: /\.css$/,
            include: [path.resolve('node_modules')],
            use: [styleOrCssLoader, getCssLoader(false), 'postcss-loader', sassLoader],
        },
    ];
};
