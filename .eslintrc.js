module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'react-hooks', 'react-refresh'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react-hooks/recommended'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json']
      }
    }
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react-refresh/only-export-components': 'off',
    // Force type-only imports from any file named "types"
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['**/types', '**/types.*', '**/lib/types', '**/lib/types.*'], message: 'Use `import type { ... } from ...` for types.', allowTypeImports: true }
      ]
    }]
  }
};
