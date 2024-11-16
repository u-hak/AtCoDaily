import { existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "./");

const outDir = resolve(rootDir, "dist");
const isExist = existsSync(outDir);
if (isExist) {
  rmSync(outDir, { recursive: true, force: true });
}

await esbuild.build({
  platform: "node",
  entryPoints: [resolve(rootDir, "src/main.ts")],
  outdir: outDir,
  bundle: true,
  treeShaking: true,
});
