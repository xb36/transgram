import { defineConfig } from "vite"
import prefresh from "@prefresh/vite"
import autoprefixer from 'autoprefixer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: `${process.env.HOST}:${process.env.PUBLIC_PORT ?? process.env.PORT}`,
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment, render } from 'preact'`,
    minify: {
      exclude: "/client/client_configuration.jsx",
      renameVariables: (name) => `tg_${name}`
    }
  },
  plugins: [prefresh()],
  css: {
    postcss: {
      plugins: [
          autoprefixer
      ]
    }
  },
  build: {
    rollupOptions: {
      input: {
        widget: resolve(__dirname, "src/client/inject.jsx"),
        demo: resolve(__dirname, "index.html")
      },
      output: {
        entryFileNames: '[name].js',
        dir: "dist",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
})
