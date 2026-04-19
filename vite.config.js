import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [
    mkcert({
      hosts: ["localhost", "127.0.0.1", "sasquatchwilderness", "sasquatchwilderness.lvh.me"]
    })
  ],
  base: "/",
  server: {
    host: true,
    https: true,
    port: 443,
    strictPort: true,
    allowedHosts: ["sasquatchwilderness.lvh.me", "sasquatchwilderness"],
    open: "/",
    proxy: {
      "/api": {
        target: "https://peanutswasteland.com",
        changeOrigin: true,
        secure: true
      }
    }
  },
  preview: {
    host: true,
    https: true,
    port: 443,
    strictPort: true,
    open: "/"
  }
});