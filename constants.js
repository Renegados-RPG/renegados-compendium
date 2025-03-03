import moduleJson from "./module.json" assert { type: "json" };

export const PACKS = moduleJson.packs.map((p) => p.name);
