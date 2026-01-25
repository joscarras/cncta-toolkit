// ============================================================================
// MAPPING OBJECTS for dynamic lookups from game data
// ============================================================================
// Note: Game data uses names with SPACES (e.g., "GDI_Construction Yard")
// but export names use UNDERSCORES for valid JavaScript identifiers.
// Use these maps when you have a string from the game and need to look up the code.

export type Unit = typeof units[keyof typeof units];

/**
 * Maps building names from game data (with spaces) to single character codes.
 * Example: buildingMap["GDI_Construction Yard"] returns "y"
 */
export const tech = {
    // GDI Buildings
    "GDI_Construction Yard": "y",
    "GDI_Power Plant": "p",
    "GDI_Refinery": "r",
    "GDI_Silo": "s",
    "GDI_Accumulator": "a",
    "GDI_Command Center": "e",
    "GDI_Barracks": "b",
    "GDI_Factory": "f",
    "GDI_Airport": "d",
    "GDI_Defense HQ": "q",
    "GDI_Defense Facility": "w",
    "GDI_Support_Air": "i",
    "GDI_Support_Ion": "x",
    "GDI_Support_Art": "z",
    "GDI_Harvester": "h",
    "GDI_Harvester_Crystal": "n",
    "GDI_Harvester_Tiberium": "j",
    // NOD Buildings
    "NOD_Construction Yard": "y",
    "NOD_Power Plant": "p",
    "NOD_Refinery": "r",
    "NOD_Silo": "s",
    "NOD_Accumulator": "a",
    "NOD_Command Post": "e",
    "NOD_Barracks": "b",
    "NOD_Factory": "f",
    "NOD_Airport": "d",
    "NOD_Defense HQ": "q",
    "NOD_Defense Facility": "w",
    "NOD_Support_Air": "i",
    "NOD_Support_Ion": "x",
    "NOD_Support_Art": "z",
    "NOD_Harvester": "h",
    "NOD_Harvester_Crystal": "n",
    "NOD_Harvester_Tiberium": "j",
    // Forgotten Buildings
    "FOR_Construction Yard": "y",
    "FOR_Refinery": "r",
    "FOR_Trade Center": "u",
    "FOR_Silo": "s",
    "FOR_Defense HQ": "q",
    "FOR_Defense Facility": "w",
    "FOR_Harvester_Crystal": "n",
    "FOR_Harvester_Tiberium": "j",
    "FOR_Crystal Booster": "v",
    "FOR_Tiberium Booster": "o",
    // Forgotten Infected Buildings
    "FOR_EVENT_Construction_Yard": "y",
    "FOR_GDI_Construction Yard": "y",
    "FOR_GDI_Power Plant": "p",
    "FOR_GDI_Refinery": "r",
    "FOR_GDI_Silo": "s",
    "FOR_GDI_Accumulator": "a",
    "FOR_GDI_Command Center": "e",
    "FOR_GDI_Barracks": "b",
    "FOR_GDI_Factory": "f",
    "FOR_GDI_Airport": "d",
    "FOR_GDI_Defense HQ": "q",
    "FOR_GDI_Defense Facility": "w",
    "FOR_GDI_Support_Air": "i",
    "FOR_GDI_Support_Ion": "x",
    "FOR_GDI_Support_Art": "z",
    "FOR_GDI_Harvester": "h",
    "FOR_GDI_Harvester_Crystal": "n",
    "FOR_GDI_Harvester_Tiberium": "j",
    "FOR_NOD_Construction Yard": "y",
    "FOR_NOD_Power Plant": "p",
    "FOR_NOD_Refinery": "r",
    "FOR_NOD_Silo": "s",
    "FOR_NOD_Accumulator": "a",
    "FOR_NOD_Command Post": "e",
    "FOR_NOD_Barracks": "b",
    "FOR_NOD_Factory": "f",
    "FOR_NOD_Airport": "d",
    "FOR_NOD_Defense HQ": "q",
    "FOR_NOD_Defense Facility": "w",
    "FOR_NOD_Support_Air": "i",
    "FOR_NOD_Support_Ion": "x",
    "FOR_NOD_Support_Art": "z",
    "FOR_NOD_Harvester": "h",
    "FOR_NOD_Harvester_Crystal": "n",
    "FOR_NOD_Harvester_Tiberium": "j",
    // Common Buildings
    "Construction Yard": "y",
    "Power Plant": "p",
    "Refinery": "r",
    "Silo": "s",
    "Accumulator": "a",
    "Command Center": "e",
    "Barracks": "b",
    "Factory": "f",
    "Airport": "d",
    "Defense HQ": "q",
    "Defense Facility": "w",
    "Support_Air": "i",
    "Support_Ion": "x",
    "Support_Art": "z",
    "Harvester": "h",
    "Harvester_Crystal": "n",
    "Harvester_Tiberium": "j",
} as const;

/**
 * Maps defense unit names from game data (with spaces) to single character codes.
 * Example: defenseMap["GDI_Def_Zone Trooper"] returns "z"
 */
export const defense = {
    // GDI Defense
    "GDI_Wall": "w",
    "GDI_Def_Predator": "d",
    "GDI_Turret": "m",
    "GDI_Def_Pitbull": "p",
    "GDI_Barbwire": "b",
    "GDI_Def_Zone Trooper": "z",
    "GDI_Flak": "f",
    "GDI_Def_Missile Squad": "q",
    "GDI_Antitank Barrier": "t",
    "GDI_Def_Sniper": "s",
    "GDI_Cannon": "c",
    "GDI_Def_APC Guardian": "g",
    "GDI_Art Tank": "a",
    "GDI_Art Air": "e",
    "GDI_Art Inf": "r",
    // NOD Defense
    "NOD_Def_Wall": "w",
    "NOD_Def_Scorpion Tank": "d",
    "NOD_Def_MG Nest": "m",
    "NOD_Def_Attack Bike": "p",
    "NOD_Def_Barbwire": "b",
    "NOD_Def_Black Hand": "z",
    "NOD_Def_Flak": "f",
    "NOD_Def_Militant Rocket Soldiers": "q",
    "NOD_Def_Antitank Barrier": "t",
    "NOD_Def_Confessor": "s",
    "NOD_Def_Cannon": "c",
    "NOD_Def_Reckoner": "g",
    "NOD_Def_Art Tank": "a",
    "NOD_Def_Art Air": "e",
    "NOD_Def_Art Inf": "r",
    // Forgotten Defense
    "FOR_Wall": "w",
    "FOR_Mammoth": "d",
    "FOR_Turret_VS_Inf": "m",
    "FOR_Veh_VS_Air": "p",
    "FOR_Barbwire_VS_Inf": "b",
    "FOR_Inf_VS_Veh": "z",
    "FOR_Turret_VS_Air": "f",
    "FOR_Inf_VS_Air": "q",
    "FOR_Barrier_VS_Veh": "t",
    "FOR_Sniper": "s",
    "FOR_Turret_VS_Veh": "c",
    "FOR_Veh_VS_Inf": "g",
    "FOR_Turret_VS_Veh_ranged": "a",
    "FOR_Turret_VS_Air_ranged": "e",
    "FOR_Turret_VS_Inf_ranged": "r",
    "FOR_Inf_VS_Inf": "i",
    "FOR_Veh_VS_Veh": "o",
    // Forgotten Fortress Defense
    "FOR_Fortress_DEF_Sniper": "s",
    "FOR_Fortress_DEF_Inf_VS_Inf": "i",
    "FOR_Fortress_DEF_Veh_VS_Air": "p",
    "FOR_Fortress_DEF_Turret_VS_Inf": "m",
    "FOR_Fortress_DEF_Turret_VS_Veh": "c",
    "FOR_Fortress_DEF_Turret_VS_Air": "f",
    "FOR_Fortress_DEF_Turret_VS_Veh_ranged": "a",
    "FOR_Fortress_DEF_Turret_VS_Air_ranged": "e",
    "FOR_Fortress_DEF_Turret_VS_Inf_ranged": "r",
    "FOR_Fortress_DEF_Mammoth": "d",
    // Forgotten Infected GDI Defense
    "FOR_GDI_Wall": "w",
    "FOR_GDI_Def_Predator": "d",
    "FOR_GDI_Turret": "m",
    "FOR_GDI_Def_Pitbull": "p",
    "FOR_GDI_Barbwire": "b",
    "FOR_GDI_Def_Zone Trooper": "z",
    "FOR_GDI_Flak": "f",
    "FOR_GDI_Def_Missile Squad": "q",
    "FOR_GDI_Antitank Barrier": "t",
    "FOR_GDI_Def_Sniper": "s",
    "FOR_GDI_Cannon": "c",
    "FOR_GDI_Def_APC Guardian": "g",
    "FOR_GDI_Art Tank": "a",
    "FOR_GDI_Art Air": "e",
    "FOR_GDI_Art Inf": "r",
    // Forgotten Infected NOD Defense
    "FOR_NOD_Def_Wall": "w",
    "FOR_NOD_Def_Scorpion Tank": "d",
    "FOR_NOD_Def_MG Nest": "m",
    "FOR_NOD_Def_Attack Bike": "p",
    "FOR_NOD_Def_Barbwire": "b",
    "FOR_NOD_Def_Black Hand": "z",
    "FOR_NOD_Def_Flak": "f",
    "FOR_NOD_Def_Militant Rocket Soldiers": "q",
    "FOR_NOD_Def_Antitank Barrier": "t",
    "FOR_NOD_Def_Confessor": "s",
    "FOR_NOD_Def_Cannon": "c",
    "FOR_NOD_Def_Reckoner": "g",
    "FOR_NOD_Def_Art Tank": "a",
    "FOR_NOD_Def_Art Air": "e",
    "FOR_NOD_Def_Art Inf": "r",
} as const;

/**
 * Maps offense unit names from game data (with spaces) to single character codes.
 * Example: offenseMap["GDI_Zone Trooper"] returns "z"
 */
export const offense = {
    // GDI Offense
    "GDI_Riflemen": "i",
    "GDI_Missile Squad": "q",
    "GDI_Zone Trooper": "z",
    "GDI_Commando": "c",
    "GDI_Sniper Team": "s",
    "GDI_APC Guardian": "g",
    "GDI_Pitbull": "p",
    "GDI_Predator": "d",
    "GDI_Juggernaut": "j",
    "GDI_Mammoth": "a",
    "GDI_Orca": "v",
    "GDI_Firehawk": "f",
    "GDI_Paladin": "o",
    "GDI_Kodiak": "k",
    // NOD Offense
    "NOD_Militants": "i",
    "NOD_Militant Rocket Soldiers": "q",
    "NOD_Black Hand": "z",
    "NOD_Commando": "c",
    "NOD_Confessor": "s",
    "NOD_Reckoner": "g",
    "NOD_Attack Bike": "p",
    "NOD_Scorpion Tank": "d",
    "NOD_Specter Artilery": "j",
    "NOD_Avatar": "a",
    "NOD_Venom": "v",
    "NOD_Vertigo": "f",
    "NOD_Cobra": "o",
    "NOD_Salamander": "k",
} as const;

/**
 * Maps offense unit names from game data (with spaces) to single character codes.
 * Example: offenseMap["GDI_Zone Trooper"] returns "z"
 */
export const terrain = {
    "Empty": ".",
    "Crystal": "c",
    "Tiberium": "t",
    "Woods": "j",
    "Scrub": "h",
    "Oil": "l",
    "Swamp": "k",
} as const;

export const units = {
    ...tech,
    ...defense,
    ...terrain,
    ...offense
} as const

export const layout = {
    ".": terrain["Empty"],
    a: tech["Accumulator"],
    c: terrain["Crystal"],
    j: tech["Harvester_Tiberium"],
    n: tech["Harvester_Crystal"],
    p: tech["Power Plant"],
    r: tech["Refinery"],
    s: tech["Silo"],
    t: terrain["Tiberium"],
} as const satisfies Record<string, Unit>;

export const empty = terrain["Empty"]