import { readdirSync, readFileSync, writeFileSync } from "fs";
import ora from "ora";
import { join } from "path";
import { PACK_SOURCE_PATH, PACKS } from "./constants.js";

const compendiunsMap = {};

// @UUID[Compendium.renegados-compendium.magias.Item.8vEFe9YqpUMNQXgO]

const mountCompendiumsMap = () => {
  const spinner = ora("Mounting compendiums map").start();
  for (const pack of PACKS) {
    const packPath = PACK_SOURCE_PATH(pack);
    const files = readdirSync(packPath);
    const compendiumMap = {};
    files
      .filter((f) => f.endsWith(".json"))
      .forEach((file) => {
        const data = JSON.parse(readFileSync(join(packPath, file), "utf8"));

        if (compendiunsMap[data._id]) {
          console.log("Duplicated compendium name", data.name);
        }
        compendiumMap[data._id] = data.name.toLowerCase();
      });
    compendiunsMap[pack] = compendiumMap;
  }
  spinner.succeed("Mounted compendiums map");
};

const MODULEPACKS = ["classes", "subclasses"];
export const execute = async () => {
  mountCompendiumsMap();
  for (const pack of MODULEPACKS) {
    const packPath = PACK_SOURCE_PATH(pack);
    const files = readdirSync(packPath);
    for (const file of files.map((f) => f).filter((f) => f.endsWith(".json"))) {
      try {
        const data = JSON.parse(readFileSync(join(packPath, file), "utf8"));
        if (data._key.startsWith("!folders!")) continue;
        const grants = data.system.advancement.filter((a) => a.type === "ItemGrant");
        grants.forEach((grant) => {
          const items = grant.configuration.items;
          items.forEach((item) => {
            const regex = /compendium\.renegados-compendium\.(.*)\.Item\.(.*)/gi;
            const match = regex.exec(item.uuid);
            if (!match) {
              console.log("No match", item.uuid, "in", data.name);
              return;
            }
            if (!compendiunsMap[match[1]][match[2]]) {
              console.log("Compendium not found", match[2], "in", data.name, "level", grant.level);
              return;
            }
          });
        });
      } catch (err) {
        console.log("Error reading file", file);
        console.log(data);
      }
    }
  }
};
