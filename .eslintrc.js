const { off } = require("process");

module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    globals: {
    },
    extends: [        
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'airbnb',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
        tsconfigRootDir: './'
    },
    ignorePatterns: ['.eslintrc.js'],
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint',
    ],
    rules: {
        indent: ['error', 4, {'SwitchCase': 1}],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        'class-methods-use-this': 'off',
        'react/require-default-props': 'off',
        'react/forbid-prop-types': 'off',
        'react/jsx-props-no-spreading': 'off',
        'no-use-before-define': 'off',
        'no-tabs': 'off',
        'linebreak-style': 'off',
        'max-len': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx', '.js', '.jsx']
        },
        'import/resolver': {
            typescript: {
                project: '.',
            }
        },
    },
    overrides: [{
        // applying the extra sets of rules that ts files require
        files: ['./src/**/*+(.ts|.tsx)'],
        excludedFiles: ['*.js', '*.jsx'],
        extends: [
            'plugin:@typescript-eslint/recommended',
        ],
        rules: {
            'react/prop-types': 'off',
        },
    }, {
        // Those are for the files used to build and transpile the app.
        // without this, it complains that some dependencies 
        // should not be on dev-dependencies, which is wrong
        // any .js file inside the 'scripts' or 'config' folders is used for building.
        // it only makes sense to have consoles there
        files: [
            './*+(.js|.ts)',
            './scripts/**/*+(.js|.ts)', 
            './config/**/*+(.js|.ts)'
        ],
        rules: {
            'no-console': 'off',
            'import/no-extraneous-dependencies': 'off',
        },
    }, {
        // tests usually need a more loose set of rules
        files: [
            './src/test/**/*+(.js|.ts|.jsx|.tsx)',
            './src/**/*.+(test|spec)+(.js|.ts|.jsx|.tsx)',            
        ],
        env: {
            jest: true,
        },
        rules: {
            'import/no-extraneous-dependencies': 'off',
            'class-methods-use-this': 'off',
            'react/require-default-props': 'off',
            'react/forbid-prop-types': 'off',
            'react/jsx-props-no-spreading': 'off',
            'no-use-before-define': 'off',
            'no-tabs': 'off',
            'react/prop-types': 'off',
        },
    }],
};