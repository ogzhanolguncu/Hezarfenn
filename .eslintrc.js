module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'eslint-plugin-tsdoc'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    node: true
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-dupe-class-members': ['error'],
    '@typescript-eslint/no-useless-constructor': ['error'],
    '@typescript-eslint/no-inferrable-types': ['off']
  }
}
