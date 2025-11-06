// eslint.config.js
import pluginJs from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint' // Typescript相关的导入
import pluginReact from 'eslint-plugin-react' // React相关的导入
import pluginReactHooks from 'eslint-plugin-react-hooks'
// Prettier相关的导入
import pluginPrettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'

export default [
  // 基础JS规则
  pluginJs.configs.recommended,
  // Typescript 规则
  ...tseslint.configs.recommended,
  // 全局设置
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true }, // 启用JSX
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // 允许全局使用 React Query 的全局变量
        __DEV__: 'readonly',
      },
    },
    settings: {
      // 自动检测 React 版本
      react: { version: 'detect' },
    },
  },

  // React核心规则
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      // React官方推荐的规则
      ...pluginReact.configs.recommended.rules,
      // React Hooks规则，强制遵守Hook依赖和调用顺序
      ...pluginReactHooks.configs.recommended.rules,

      // 优化/自定义规则
      'react/react-in-jsx-scope': 'off', // React 17+新特性，不需要导入React
      'react/prop-types': 'off', // 使用TypeScript/Interface代替 prop-types
    },
  },

  // Prettier格式化规则 (放在最后避免冲突)
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...configPrettier.rules, // 导入 Prettier规则
      'prettier/prettier': 'error', // 将 Prettier 格式问题报告为 ESLint 错误
    },
  },

  // 忽略文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'vite.config.ts', // 通常不对配置脚本执行严格的业务代码检查
    ],
  },
]
