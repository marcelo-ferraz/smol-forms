const { tsJsRule, jsSrcMapRule } = require('./jsAndTsRules');
const getCssRules = require('./getCssRules');

const imagesRule = {
    test: /\.(png|svg|jpg|jpeg|gif)$/i,
    type: 'asset/resource',
    generator: {
        filename: 'images/[name][ext]',
    },
};

const fontsRule = {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
    generator: {
        filename: 'fonts/[name][ext]',
    },
};

module.exports = {
    imagesRule,
    fontsRule,
    tsJsRule,
    jsSrcMapRule,
    getCssRules,
};
