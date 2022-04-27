const path = require('path');

const contextPath = path.resolve(__dirname, '../');

module.exports = {
    context: contextPath,
    src: path.resolve(contextPath, './src'),
    static: path.resolve(contextPath, './static'),
    output: path.resolve(contextPath, './dist'),
};
