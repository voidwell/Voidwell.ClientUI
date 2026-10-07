// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = tseslint.config(
  { ignores: ['dist/**', 'out-tsc/**', '.angular/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    plugins: { 'unused-imports': unusedImports },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: [], style: 'camelCase' }],
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/no-input-rename': 'warn',
      '@angular-eslint/no-output-native': 'warn',
      '@angular-eslint/no-output-on-prefix': 'warn',
      '@angular-eslint/no-inputs-metadata-property': 'warn',
      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'no-cond-assign': 'warn',
      'no-useless-assignment': 'warn',
      'no-unexpected-multiline': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-this-alias': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn'
    }
  },
  // Architecture: features -> shared -> core. Lower layers never import upper ones, and features never import each other.
  {
    files: ['src/app/core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        { group: ['@features/*', '**/features/**'], message: 'core must not depend on features' },
        { group: ['@shared/*'], message: 'core must not depend on shared' }
      ] }]
    }
  },
  {
    files: ['src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        { group: ['@features/*', '**/features/**'], message: 'shared must not depend on features' }
      ] }]
    }
  },
  {
    files: ['src/app/features/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        { group: ['@features/*'], message: 'features must not import each other; move shared code to shared/ or core/' }
      ] }]
    }
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended],
    rules: {
      '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }]
    }
  }
);
