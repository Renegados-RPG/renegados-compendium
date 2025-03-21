import { compilePack } from "@foundryvtt/foundryvtt-cli";
import ora from "ora";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PACKS } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const execute = async () => {
  for (const pack of PACKS) {
    const sp = ora(`Compiling ${pack} source`).start();

    const packPath = join(__dirname, "..", "packs", pack);
    const destPath = join(__dirname, "..", "packs_source", pack);
    await compilePack(destPath, packPath);
    sp.succeed(`Compiled ${pack} source`);
  }
};
