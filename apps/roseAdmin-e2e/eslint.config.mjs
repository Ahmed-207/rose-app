import baseConfig from '../../eslint.base.config.mjs';
import playwright from 'eslint-plugin-playwright';

export default [
  playwright.configs['flat/recommended'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    // Override or add rules here
    rules: {},
  },
];
