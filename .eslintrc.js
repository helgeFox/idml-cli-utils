module.exports = {
    "env": {
        // "browser": false,
        "node": true,
        "es6": true
        // "amd": true
    },
    "extends": "eslint:recommended",
    "global": [
        "define",
        "jQuery"
    ],
    "rules": {
        "brace-style": ["warn", "stroustrup", { "allowSingleLine": true }],
        "comma-spacing": ["warn", { "before": false, "after": true }],
        "curly": ["warn", "multi-line"], //, "multi-or-nest"],
        "keyword-spacing": "warn",
        "no-multiple-empty-lines": ["warn", {"max": 1}],
        "no-trailing-spaces": "warn",
        // "object-curly-newline": ["error", {"ObjectExpression": {multiline: true}}],
        // "quotes": ["warn", "single"],
        "semi-spacing": ["warn", {"before": false, "after": true}],
        "space-before-blocks": "warn",
        // "space-before-function-paren": "warn",
        "space-infix-ops": "warn",
        "indent": ["warn", 'tab'],

        // disable unwanted rules:
        "no-unused-vars": "off",
        "no-console": "off"
    }
};