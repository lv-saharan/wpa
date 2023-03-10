import pkg from "./package.json" assert { type: "json" };
import esbuild from "esbuild";
import { dev } from "local-dev-server";
import path from "path";
const [mode] = process.argv.splice(2);
const outfile = `./dist/wpa.js`;
const options = {
  define: {},
  entryPoints: ["src/wpa.js"],
  outfile,
  format: "esm",
  bundle: true,
  sourcemap: true,
  minify: true,
  plugins: [
    {
      name: "omi-map",
      setup(build) {
        build.onResolve({ filter: /omi\/src\/extend/ }, (args) => {
          return { path: path.resolve("./src/extend.js") };
        });
      },
    },
  ],
};

if (mode == "dev") {
  const { reload } = dev({ ...pkg.localDev.server, openBrowser: false });
  const ctx = await esbuild.context({
    ...options,
    plugins: [
      {
        name: "watch-plugin",
        setup(build) {
          console.log("watch plugin setup");
          build.onStart(() => {
            console.log("build starting....");
          });
          build.onEnd((result) => {
            if (result.errors.length == 0) {
              console.log("build ok");
            } else {
              console.log("build error");
            }
          });
        },
      },
    ],
  });
  await ctx.watch();
} else {
  esbuild.build(options);
}
