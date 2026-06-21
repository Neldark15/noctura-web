import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  // viteSingleFile empaqueta TODO (JS + CSS) dentro de un único index.html
  plugins: [react(), viteSingleFile()],
  // trata los .glb como assets (para importarlos y embeberlos en el build)
  assetsInclude: ['**/*.glb'],
  // Fuerza una sola copia de three (evita el bug de "Multiple instances of
  // Three.js" que rompe Rapier cuando una dep arrastra otra versión).
  resolve: {
    dedupe: ['three'],
  },
  server: {
    host: true, // expone el server en la red local para probar en el celular
  },
})
