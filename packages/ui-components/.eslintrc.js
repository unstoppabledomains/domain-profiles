module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    // Allows for the parsing of modern ECMAScript features
    ecmaVersion: 2020,
    ecmaFeatures: {
      // allows for the parsing of JSX
      jsx: true,
    },
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['react', 'tss-unused-classes', 'sort-exports'],
  extends: ['airbnb/hooks', 'plugin:@next/next/recommended'],
  rules: {
    'tss-unused-classes/unused-classes': 'off',
    '@next/next/link-passhref': 'off',
    '@next/next/no-img-element': 'off',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/iframe-has-title': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/tabindex-no-positive': 'off',
    'no-console': 'off',
    'promise/prefer-await-to-then': 'off',
    'react/button-has-type': 'off',
    'react/destructuring-assignment': 'off',
    'react/function-component-definition': 'off',
    'react/no-invalid-html-attribute': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react/jsx-boolean-value': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/jsx-fragments': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'react/jsx-no-duplicate-props': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/jsx-pascal-case': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
    'react/no-danger': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/no-unused-prop-types': 'off',
    'react/require-default-props': 'off',
    'react/self-closing-comp': 'off',
    'react/state-in-constructor': 'off',
    'spaced-comment': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'import/no-duplicates': ['error'],
    'sort-exports/sort-exports': ['error', {sortDir: 'asc'}],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
      },
    ],

    'import/order': [
      'error',
      {
        groups: [],
      },
    ],

    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            // https://mui.com/material-ui/guides/minimizing-bundle-size#option-one-use-path-imports
            group: ['@mui/*/*/*'],
            message: `Please use second-level imports: '@mui/*/*'. `,
          },
        ],
        paths: [
          {
            name: '@unstoppabledomains/ui-kit/colors',
            message: `Please use '@mui/material/colors' instead. `,
          },
          {
            name: '@unstoppabledomains/ui-kit/icons',
            message: `Please use '@mui/icons-material/*' path imports instead. `,
          },
          {
            name: '@mui/icons-material',
            message: `Please use '@mui/icons-material/*' path imports instead. `,
          },
          {
            name: '@unstoppabledomains/ui-kit/lab',
            message: `Please use '@mui/lab/*' path imports instead. `,
          },
          {
            name: '@mui/lab',
            message: `Please use '@mui/lab/*' path imports instead. `,
          },
          {
            name: '@unstoppabledomains/ui-kit',
            message: `Please use '@mui/material/*' or '@unstoppabledomains/ui-kit/components' path imports instead. `,
          },
          {
            name: '@mui/material',
            message: `Please use '@mui/material/*' path imports instead. `,
          },
          {
            name: '@mui/material/Alert',
            importNames: ['default', 'AlertProps', 'AlertClasses'],
            message: `Please use '@unstoppabledomains/ui-kit/components' instead. `,
          },
        ],
      },
    ],
  },
};
