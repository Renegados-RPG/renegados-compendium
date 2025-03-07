import { extractPack } from "@foundryvtt/foundryvtt-cli";
import ora from "ora";
import { PACK_PATH, PACK_SOURCE_PATH, PACKS } from "./constants.js";
import { rmSync, existsSync } from "fs";

export const deleteSources = async () => {
  for (const pack of PACKS) {
    const sp = ora(`Deleting ${pack} source`).start();

    const destPath = PACK_SOURCE_PATH(pack);
    if (existsSync(destPath)) {
      await rmSync(destPath, { recursive: true });
    }
    sp.succeed(`Deleted ${pack} source`);
  }
};

export const execute = async () => {
  for (const pack of PACKS) {
    const sp = ora(`Extracting ${pack} source`).start();

    const packPath = PACK_PATH(pack);
    const destPath = PACK_SOURCE_PATH(pack);
    await extractPack(packPath, destPath);
    sp.succeed(`Extracted ${pack} source`);
  }
};
