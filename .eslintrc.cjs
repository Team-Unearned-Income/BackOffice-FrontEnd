module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,
  parserOptions: {
    ecmaVersion: 2021 // Allows for the parsing of modern ECMAScript features
  },
  env: {
    node: true,
    browser: true,
    'vue/setup-compiler-macros': true
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended'],
  plugins: [
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-files
    // required to lint *.vue files
    'vue'

    // https://github.com/typescript-eslint/typescript-eslint/issues/389#issuecomment-509292674
    // Prettier has not been included as plugin to avoid performance impact
    // add it as an extension for your IDE
  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  // add your custom rules here
  rules: {
    'vue/attributes-order': [
      'warn',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'EVENTS',
          'CONTENT'
        ],
        alphabetical: false
      }
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn', {'argsIgnorePattern': '^_'}],
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
    'vue/html-closing-bracket-newline': [
      'warn',
      {
        singleline: 'never',
        multiline: 'always',
        selfClosingTag: {
          singleline: 'never',
          multiline: 'always'
        }
      }
    ],
    'vue/multiline-html-element-content-newline': [
      'warn',
      {
        ignoreWhenEmpty: true,
        ignores: [],
        allowEmptyLines: false
      }
    ],
    'vue/attribute-hyphenation': [
      'warn',
      'always',
      {
        ignore: []
      }
    ],
    'vue/no-v-html': 'error',
    'vue/no-template-shadow': ['error', { allow: [] }],
    'vue/require-explicit-emits': [
      'error',
      {
        allowProps: false
      }
    ],
    'vue/v-on-event-hyphenation': [
      'warn',
      'always',
      {
        autofix: true,
        ignore: []
      }
    ],
    'vue/v-on-style': ['warn', 'shorthand'],
    'vue/v-slot-style': [
      'warn',
      {
        atComponent: 'v-slot',
        default: 'shorthand',
        named: 'shorthand'
      }
    ],
    'vue/multi-word-component-names': 'off'
  }
}
