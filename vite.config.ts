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
        '@univerjs/engine-formula',
        '@univerjs/engine-numfmt',
        '@univerjs/facade',
        '@univerjs/engine-render',
        '@univerjs/network',
        '@univerjs/rpc',
        '@univerjs/sheets',
        '@univerjs/sheets-formula',
        '@univerjs/sheets-numfmt',
        '@univerjs/sheets-ui',
        '@univerjs/uniscript',
        '@univerjs/docs-ui',
        '@univerjs/docs',
        '@wendellhu/redi',
        '@wendellhu/redi/react-bindings',
        'react-arborist',
        'react-dnd',
        'react-dnd-html5-backend',
        'dnd-core',
        'clsx',
        'react',
        'react-dom',
        'rxjs',
        'react-arborist/dist/module/components/default-container',
        'react-arborist/dist/module/types/tree-props',
      ],
      output: {
        assetFileNames: 'index.css',
        globals: {
          '@univerjs/core': 'UniverCore',
          '@univerjs/design': 'UniverDesign',
          '@univerjs/ui': 'UniverUi',
          '@univerjs/engine-formula': 'UniverFormula',
          '@univerjs/engine-numfmt': 'UniverNumfmt',
          '@univerjs/facade': 'UniverFacade',
          '@univerjs/sheets-ui': 'UniverSheetsUi',
          '@univerjs/engine-render': 'UniverRender',
          '@wendellhu/redi': '@wendellhu/redi',
          '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
          clsx: 'clsx',
          react: 'React',
          rxjs: 'rxjs',
          'react-dom': 'ReactDOM',
          'react-arborist': 'reactArborist',
          'react-dnd': 'reactDnd',
          'dnd-core': 'dndCore',
          'react-dnd-html5-backend': 'reactDndHtml5Backend',
          'react-arborist/dist/module/components/default-container': 'defaultContainer',
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
