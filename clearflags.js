import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import * as prettier from "prettier";
import { fileURLToPath } from "url";
import { PACKS } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clearFlags = async (filePath) => {
  const data = JSON.parse(readFileSync(filePath, "utf8"));

  if (data.flags.plutonium) {
    console.log("Flag plutonium found in", filePath);
    delete data.flags.plutonium;
  }

  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing file", filePath, err);
  }
};

const clearFlagsInFolder = (folderPath) => {
  const files = readdirSync(folderPath);
  files.forEach((file) => {
    clearFlags(join(folderPath, file));
  });
};

const execute = async () => {
  for (const pack of PACKS) {
    console.log("Clearing flags in", pack);
    const sourcesPath = join(__dirname, "packs_source", pack);
    clearFlagsInFolder(sourcesPath);
    console.log("Cleared flags in", pack);
  }
};

execute();
