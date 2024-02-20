import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

import { name } from './package.json';

const libName = name
  .replace('@univerjs/', 'univer-')
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

export default defineConfig(({ mode }) => ({
  resolve: {
    // 配置路径别名
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
        },
      },
    },
  },
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      outDir: 'lib/types',
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: 'univer-[local]',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  build: {
    target: 'chrome70',
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: libName,
      fileName: (format) => `${format}/index.js`,
      formats: ['es', 'umd', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@univerjs/core',
        '@univerjs/design',
        '@univerjs/ui',
        '@wendellhu/redi',
        '@wendellhu/redi/react-bindings',
        'clsx',
        'react',
        'react-dom',
        'rxjs',
      ],
      output: {
        assetFileNames: 'index.css',
        globals: {
          '@univerjs/core': 'UniverCore',
          '@univerjs/design': 'UniverDesign',
          '@univerjs/ui': 'UniverUi',
          '@wendellhu/redi': '@wendellhu/redi',
          '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
          clsx: 'clsx',
          react: 'React',
          rxjs: 'rxjs',
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    coverage: {
      // provider: "istanbul",
      reporter: ['html', 'json'],
      provider: 'custom',
      customProviderModule: '@vitest/coverage-istanbul',
    },
  },
}));
