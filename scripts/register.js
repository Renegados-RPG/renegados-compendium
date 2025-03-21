import { Converters as babeleConverters } from "../../babele/script/converters.js";

const MODULE_ID = "renegados-compendium";

// No need to change the code below this line, but it’s your module so do it if you want!

Hooks.on("init", () => {
  game.settings.register(MODULE_ID, "autoRegisterBabel", {
    name: "Automatically activate translation via Babele",
    hint: "Automatically implements Babele translations without needing to point to the directory containing the translations.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: (value) => {
      if (value) {
        autoRegisterBabel();
      }

      window.location.reload();
    },
  });

  game.settings.register(MODULE_ID, "convert", {
    name: "Conversões automáticas",
    hint: "Aplica o sistema métrico a todas as medições, distâncias",
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    onChange: (convert) => {
      setEncumbranceData();
      fixExhaustion();
    },
  });

  if (game.settings.get(MODULE_ID, "autoRegisterBabel")) {
    autoRegisterBabel();
  }

  if (game.settings.get(MODULE_ID, "convert")) {
    setEncumbranceData();
    fixExhaustion();
  }
});

function autoRegisterBabel() {
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: MODULE_ID,
      lang: "pt-BR",
      dir: "lang/pt-BR/compendium",
    });

    Babele.get().registerConverters({
      items: babeleConverters.fromDefaultMapping("Item", "items"),
      range: Converters.imperialToMetric("range"),
      weight: Converters.imperialToMetric("weight"),
      target: Converters.imperialToMetric("target"),
      senses: Converters.imperialToMetric("senses"),
      movement: Converters.imperialToMetric("movement"),
      sightRange: Converters.imperialToMetric("sightRange"),
      rangeActivities: Converters.imperialToMetric("rangeActivities"),
      distanceAdvancement: Converters.imperialToMetric("distanceAdvancement"),
      pages: Converters.pages(),
      source: Converters.source(),
      effects: Converters.effects(),
      activities: Converters.activities(),
      advancement: Converters.advancement(),
    });
  }
}

Hooks.once("ready", () => {
  setEncumbranceData();
  fixExhaustion();
});

Hooks.on("createScene", (scene) => {
  if (convertEnabled()) {
    scene.update({ "grid.units": "m", "grid.distance": 1.5 });
  }
});

function convertEnabled() {
  return game.settings.get(MODULE_ID, "convert");
}

function setEncumbranceData() {
  let convert = convertEnabled();
  game.settings.set("dnd5e", "metricWeightUnits", convert);
  game.settings.set("dnd5e", "metricLengthUnits", convert);
  game.settings.set("dnd5e", "metricVolumeUnits", convert);
  game.settings.set("dnd5e", "rulesVersion", "legacy");
  game.settings.set("core", "chatBubblesPan", false);
  game.settings.set("core", "leftClickRelease", true);
  if (game.user.role === 4) {
    game.settings.set("dnd5e", "packSourceConfiguration", {
      "dnd5e.classfeatures": false,
      "dnd5e.classes": false,
      "dnd5e.items": true,
      "dnd5e.monsterfeatures": false,
      "dnd5e.races": false,
      "dnd5e.spells": false,
      "dnd5e.subclasses": false,
      "dnd5e.heroes": false,
      "dnd5e.monsters": false,
      "dnd5e.tradegoods": true,
      "dnd5e.backgrounds": false,
      "dnd5e.rules": true,
      "dnd5e.tables": true,
    });
  }

  if (convert) {
    CONFIG.DND5E.movementUnits = {
      m: CONFIG.DND5E.movementUnits.m,
      km: CONFIG.DND5E.movementUnits.km,
      ft: CONFIG.DND5E.movementUnits.ft,
      mi: CONFIG.DND5E.movementUnits.mi,
    };
  }
}

function fixExhaustion() {
  // Fix system bug (2024 rules)
  if (convertEnabled()) {
    CONFIG.DND5E.conditionTypes.exhaustion.reduction = foundry.utils.mergeObject(
      CONFIG.DND5E.conditionTypes.exhaustion.reduction,
      { speed: 1.5 },
    );
  }
}

/**
 * Utility class with all predefined converters
 */

export class Converters {
  static imperialToMetric(type) {
    return (value) => {
      if (!convertEnabled()) return value;

      switch (type) {
        case "range":
          return Converters.range(value);
        case "weight":
          return Converters.weight(value);
        case "target":
          return Converters.target(value);
        case "senses":
          return Converters.senses(value);
        case "movement":
          return Converters.movement(value);
        case "sightRange":
          return Converters.footsToMeters(value);
        case "rangeActivities":
          return Converters.rangeActivities(value);
        case "distanceAdvancement":
          return Converters.distanceAdvancement(value);
        default:
          console.warn(`Type: '${type}' not implemented !`);
          break;
      }
    };
  }

  static conversionInfo = {
    ft: {
      converter: Converters.footsToMeters,
      units: "m",
    },
    mi: {
      converter: Converters.milesToMeters,
      units: "km",
    },
  };

  static range(range) {
    const conversion = Converters.conversionInfo[range.units];
    if (conversion) {
      return foundry.utils.mergeObject(range, {
        value: conversion.converter(range.value),
        long: conversion.converter(range.long),
        reach: conversion.converter(range.reach),
        units: conversion.units,
      });
    } else {
      console.warn(`Range units: '${range.units}' not implemented !`);
    }

    return range;
  }

  static weight(weight) {
    if (weight.units === "kg") return weight;

    return foundry.utils.mergeObject(weight, {
      value: Converters.lbToKg(weight.value),
      units: "kg",
    });
  }

  static target(target) {
    const conversion = Converters.conversionInfo[target.template.units];
    if (conversion) {
      return foundry.utils.mergeObject(target, {
        template: {
          size: conversion.converter(target.template.size),
          height: conversion.converter(target.template.height),
          width: conversion.converter(target.template.width),
          units: conversion.units,
        },
        affects: {
          count: conversion.converter(target.affects.count),
        },
      });
    } else {
      console.warn(`Target units: '${target.template.units}' not implemented !`);
    }

    return target;
  }

  static senses(senses) {
    const conversion = Converters.conversionInfo[senses.units ?? "ft"];
    if (conversion) {
      return foundry.utils.mergeObject(senses, {
        darkvision: conversion.converter(senses.darkvision),
        blindsight: conversion.converter(senses.blindsight),
        tremorsense: conversion.converter(senses.tremorsense),
        truesight: conversion.converter(senses.truesight),
        units: conversion.units,
      });
    } else {
      console.warn(`Senses units: '${senses.units}' not implemented !`);
    }

    return senses;
  }

  static movement(movement) {
    const conversion = Converters.conversionInfo[movement.units ?? "ft"];
    if (conversion) {
      return foundry.utils.mergeObject(movement, {
        burrow: conversion.converter(movement.burrow),
        climb: conversion.converter(movement.climb),
        swim: conversion.converter(movement.swim),
        walk: conversion.converter(movement.walk),
        fly: conversion.converter(movement.fly),
        units: conversion.units,
      });
    } else {
      console.warn(`Movement units: '${movement.units}' not implemented !`);
    }

    return movement;
  }

  static rangeActivities(activities) {
    Object.keys(activities).forEach((key) => {
      Converters.range(activities[key].range);

      const conversion = Converters.conversionInfo[activities[key].target?.template?.units];
      if (conversion) {
        foundry.utils.mergeObject(activities[key].target.template, {
          size: conversion.converter(activities[key].target.template.size),
          units: conversion.units,
        });
      }
    });

    return activities;
  }

  static distanceAdvancement(advancements) {
    advancements.forEach((adv) => {
      if (adv.type === "ScaleValue" && adv.configuration.type === "distance") {
        const conversion = Converters.conversionInfo[adv.configuration.distance.units];
        if (conversion) {
          foundry.utils.mergeObject(adv.configuration.distance, {
            units: conversion.units,
          });

          Object.keys(adv.configuration.scale).forEach((key) => {
            foundry.utils.mergeObject(adv.configuration.scale[key], {
              value: conversion.converter(adv.configuration.scale[key].value),
            });
          });
        }
      }
    });
  }

  static footsToMeters(ft) {
    if (!ft || isNaN(parseInt(ft))) return ft;

    return Converters.round(parseInt(ft) * 0.3);
  }

  static milesToMeters(mi) {
    if (!mi || isNaN(parseInt(mi))) return mi;

    return Converters.round(parseInt(mi) * 1.5);
  }

  static round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  static lbToKg(lb) {
    if (!lb) return lb;

    return parseInt(lb) / 2;
  }

  // Override babele pages converters
  static pages() {
    return (pages, translations) => Converters._pages(pages, translations);
  }

  static _pages(pages, translations) {
    return pages.map((data) => {
      if (!translations) {
        return data;
      }

      const translation = translations[data._id] || translations[data.name];
      if (!translation) {
        console.warn(`Missing translation : ${data._id} ${data.name}`);
        return data;
      }

      return foundry.utils.mergeObject(data, {
        name: translation.name ?? data.name,
        image: { caption: translation.caption ?? data.image.caption },
        src: translation.src ?? data.src,
        text: { content: translation.text ?? data.text.content },
        video: {
          width: translation.width ?? data.video.width,
          height: translation.height ?? data.video.height,
        },
        system: {
          tooltip: translation.tooltip ?? data.system.tooltip,
          subclassHeader: translation.subclassHeader ?? data.system.subclassHeader,
          unlinkedSpells: data.system.unlinkedSpells
            ? Converters.unlinkedSpells(data.system.unlinkedSpells, translation.unlinkedSpells)
            : data.system.unlinkedSpells,
          description: {
            value: translation.description ?? data.system.description?.value,
            additionalEquipment: translation.additionalEquipment ?? data.system.description?.additionalEquipment,
            additionalHitPoints: translation.additionalHitPoints ?? data.system.description?.additionalHitPoints,
            additionalTraits: translation.additionalTraits ?? data.system.description?.additionalTraits,
            subclass: translation.subclass ?? data.system.description?.subclass,
          },
        },
        flags: {
          dnd5e: { title: translation.flagsTitle ?? data.flags.dnd5e?.title },
        },
        translated: true,
      });
    });
  }

  static unlinkedSpells(unlinkedSpells, translations) {
    if (!translations) return unlinkedSpells;

    if (Array.isArray(unlinkedSpells)) {
      return unlinkedSpells.map((spell) => {
        const translation = translations[spell.name];
        if (translation) {
          return foundry.utils.mergeObject(spell, {
            name: translation.name ?? spell.name,
          });
        }
        return profile;
      });
    }

    return unlinkedSpells;
  }

  static source() {
    return (source) => Converters._source(source);
  }

  static _source(source) {
    return foundry.utils.mergeObject(source, {
      book: sources[source.book],
      custom: sources[source.custom],
    });
  }

  static effects() {
    return (data, translations) => Converters._effects(data, translations);
  }

  static _effects(data, translations) {
    if (!translations) {
      return data;
    }
    if (typeof data !== "object") {
      return translations;
    }

    if (Array.isArray(data)) {
      return data.map((effect) => {
        const translation = translations[effect._id] || translations[effect.name];
        if (translation) {
          return foundry.utils.mergeObject(effect, {
            name: translation.name ?? effect.name,
            description: translation.description ?? effect.description,
            changes: effect.changes ? Converters.effectsChanges(effect.changes, translation.changes) : effect.changes,
          });
        }
        return effect;
      });
    }

    return data;
  }

  static effectsChanges(changes, translations) {
    const movementSensesType = [
      "system.attributes.movement.burrow",
      "system.attributes.movement.climb",
      "system.attributes.movement.fly",
      "system.attributes.movement.swim",
      "system.attributes.movement.walk",
      "system.attributes.senses.blindsight",
      "system.attributes.senses.darkvision",
      "system.attributes.senses.tremorsense",
      "system.attributes.senses.truesight",
    ];

    changes.forEach((change) => {
      if (change.mode != 1 && movementSensesType.includes(change.key)) {
        change.value = Converters.footsToMeters(change.value);
      }
      return change;
    });

    if (!translations) return changes;

    if (Array.isArray(changes)) {
      return changes.map((change) => {
        const translation = translations[change.key];
        if (translation) {
          return foundry.utils.mergeObject(change, {
            value: translation ?? change.value,
          });
        }
        return change;
      });
    }

    return changes;
  }

  static activities() {
    return (activities, translations) => Converters._activities(activities, translations);
  }

  static _activities(activities, translations) {
    if (!translations) return activities;

    Object.keys(activities).forEach((key) => {
      const activity = activities[key];
      const translationKey = activity.name?.length ? activity.name : activity.type;
      const translation = translations[activity._id] || translations[translationKey];
      if (translation) {
        foundry.utils.mergeObject(activity, {
          name: translation.name ?? activity.name,
          activation: {
            condition: translation.condition ?? activity.activation?.condition,
          },
          description: {
            chatFlavor: translation.chatFlavor ?? activity.description?.chatFlavor,
          },
          profiles: activity.profiles
            ? Converters.summonProfiles(activity.profiles, translation.profiles)
            : activity.profiles,
        });
      }
    });

    return activities;
  }

  static summonProfiles(profiles, translations) {
    if (!translations) return profiles;

    if (Array.isArray(profiles)) {
      return profiles.map((profile) => {
        const translation = translations[profile.name];
        if (translation) {
          return foundry.utils.mergeObject(profile, {
            name: translation.name ?? profile.name,
          });
        }
        return profile;
      });
    }

    return profiles;
  }

  static advancement() {
    return (advancements, translations) => Converters._advancement(advancements, translations);
  }

  static _advancement(advancements, translations) {
    if (!translations) return advancements;

    return advancements.map((adv) => {
      const translation = translations[adv._id] || translations[adv.title];
      if (translation) {
        return foundry.utils.mergeObject(adv, {
          title: translation.title ?? adv.title,
          hint: translation.hint ?? adv.hint,
        });
      }
      return adv;
    });
  }
}

export var sources = {
  "SRD 5.1": "DRS 5.1",
};
