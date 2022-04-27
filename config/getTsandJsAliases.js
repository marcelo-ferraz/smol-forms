const path = require('path');
const tsconfig = require('../tsconfig.json');

module.exports = () => Object
    .entries(tsconfig.compilerOptions.paths)
    .map(([aliasName, [aliasPath]]) => [
        aliasName.substring(0, aliasName.length - 2),
        path.resolve(process.cwd(), aliasPath.substring(0, aliasPath.length - 2)),
    ])
    .reduce((aliases, [aliasName, aliasPath]) => ({
        ...aliases,
        [aliasName]: aliasPath,
    }), {});
