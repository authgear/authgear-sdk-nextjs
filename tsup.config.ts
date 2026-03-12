import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    client: "src/client.ts",
    server: "src/server.ts",
    proxy: "src/proxy.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["next", "react", "react-dom"],
  banner: {
    js: "",
  },
});
