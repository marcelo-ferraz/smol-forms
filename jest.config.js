const tsconfig = require('./tsconfig.json');

/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom', // 'node',
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    // reporters: ['jest-progress-bar-reporter'],
    transform: {
        '.+\\.(j|t)sx?$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    transformIgnorePatterns: [
        '.git/.*',
        'node_modules/.*',
        'dist/.*',
        'coverage/',
    ],
    modulePaths: [
        '<rootDir>/src',
        '<rootDir>/node_modules',
    ],
    moduleNameMapper: Object
        .entries(tsconfig.compilerOptions.paths)
        .map(([aliasName, [aliasPath]]) => [
            // "@local/app/*": ["src/app/*"],
            // into
            // "^@local/app(.*)$": "<rootDir>/src/app$1",
            `^${aliasName.substring(0, aliasName.length - 2)}(.*)$`,
            `<rootDir>/${aliasPath.substring(0, aliasPath.length - 2)}$1`,
        ])
        .reduce((aliases, [aliasName, aliasPath]) => ({
            ...aliases,
            [aliasName]: aliasPath,
        }), {}),
};
