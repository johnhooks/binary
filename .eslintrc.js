module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  plugins: ['jest', 'import', '@typescript-eslint'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    // 'plugin:import/typescript',
    'plugin:jest/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: false, // Allows for the parsing of JSX
    },
  },
  settings: {
    // 'import/extensions': ['.js', '.ts' ],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', , '.ts'],
      },
    },
  },
  rules: {
    'no-console': 0,
    'no-plusplus': 'off',
    'no-unused-vars': 'off',
    'no-underscore-dangle': 'off',
    'no-useless-constructor': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    'func-names': ['error', 'never'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { consistent: true },
        ObjectPattern: { consistent: true },
        ImportDeclaration: 'never',
        ExportDeclaration: { consistent: true },
      },
    ],
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    // Fixes errors about missing `ts` extension on imports
    // https://github.com/benmosher/eslint-plugin-import/issues/1615
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        'd.ts': 'never',
      },
    ],
  },
  overrides: [
    {
      // enable the rules specifically for TypeScript files
      files: ['*.ts'],
      rules: {
        'no-dupe-class-members': 'off',
        '@typescript-eslint/no-var-requires': ['error'],
      },
    },
  ],
  env: {
    // browser: true,
    node: true,
    'jest/globals': true,
  },
  globals: {
    BigInt: true,
  },
};
