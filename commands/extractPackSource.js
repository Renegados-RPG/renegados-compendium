import { extractPack } from "@foundryvtt/foundryvtt-cli";
import ora from "ora";
import { PACK_PATH, PACK_SOURCE_PATH, PACKS } from "./constants.js";

export const execute = async () => {
  for (const pack of PACKS) {
    const sp = ora(`Extracting ${pack} source`).start();

    const packPath = PACK_PATH(pack);
    const destPath = PACK_SOURCE_PATH(pack);
    await extractPack(packPath, destPath);
    sp.succeed(`Extracted ${pack} source`);
  }
};
