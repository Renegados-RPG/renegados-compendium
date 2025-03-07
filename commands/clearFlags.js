import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import ora from "ora";
import { PACK_SOURCE_PATH, PACKS } from "./constants.js";

const clearFlags = async (filePath) => {
  const spinner = ora(`Clearing flags in ${filePath}`).start();
  try {
    const data = JSON.parse(readFileSync(filePath, "utf8"));

    if (data.flags.plutonium) {
      delete data.flags.plutonium;
      spinner.succeed(`Cleared flags in ${filePath}`);
    } else {
      spinner.stop();
    }

    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      spinner.fail(`Error writing file ${filePath}`);
    }
  } catch (err) {
    spinner.fail(`Error parsing file ${filePath}`);
  }
};

const clearFlagsInFolder = (folderPath) => {
  const files = readdirSync(folderPath);
  files.forEach((file) => {
    clearFlags(join(folderPath, file));
  });
};

export const execute = async () => {
  for (const pack of PACKS) {
    const spinner = ora(`Clearing flags in ${pack}`).start();
    const sourcesPath = PACK_SOURCE_PATH(pack);
    clearFlagsInFolder(sourcesPath);
    spinner.succeed(`Cleared flags in ${pack}`);
  }
};
