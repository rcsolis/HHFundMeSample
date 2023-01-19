module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ['google'],
    plugins: [],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        'max-len': ['error', { code: 120 }],
        'quote-props': ['error', 'as-needed'],
        indent: ['error', 4],
        quotes: ['error', 'single'],
        'object-curly-spacing': ['error', 'always'],
        'space-before-function-paren': ['error', 'always'],
    },
};
