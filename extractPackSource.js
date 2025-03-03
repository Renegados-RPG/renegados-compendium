import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PACKS } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execute = async () => {
  for (const pack of PACKS) {
    console.log(`Extracting ${pack} source`);

    const packPath = join(__dirname, "packs", pack);
    const destPath = join(__dirname, "packs_source", pack);
    await extractPack(packPath, destPath);
  }
};

execute();
