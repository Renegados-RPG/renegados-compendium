import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import moduleJson from "../module.json" with { type: "json" };

export const PACKS = moduleJson.packs.map((p) => p.name);

export const PACK_SOURCE_PATH = (pack) => join(__dirname, "..", "packs_source", pack);
export const PACK_PATH = (pack) => join(__dirname, "..", "packs", pack);
export const MODULE_PATH = join(__dirname, "..");
