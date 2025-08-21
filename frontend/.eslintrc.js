module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // DOM prop 전달 관련 규칙
    'react/no-unknown-property': 'error',
    'react/forbid-dom-props': [
      'error',
      {
        forbid: [
          {
            propName: 'isOpen',
            message: 'Use data-is-open instead of isOpen for DOM elements',
          },
          {
            propName: 'isActive',
            message: 'Use data-is-active instead of isActive for DOM elements',
          },
          {
            propName: 'isVisible',
            message: 'Use data-is-visible instead of isVisible for DOM elements',
          },
          {
            propName: 'isLoading',
            message: 'Use data-is-loading instead of isLoading for DOM elements',
          },
        ],
      },
    ],
    
    // 파일명 일관성 관련 규칙
    'import/no-unresolved': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        '': 'never',
        'ts': 'never',
        'tsx': 'never',
        'js': 'never',
        'jsx': 'never'
      }
    ],
    'import/no-extensions': 'error',
    
    // 커스텀 prop 필터링 강제
    'react/jsx-props-no-spreading': [
      'error',
      {
        html: 'enforce',
        custom: 'enforce',
        exceptions: ['rest'],
      },
    ],
    
    // 일반적인 React 규칙
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    
    // TypeScript 규칙
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
