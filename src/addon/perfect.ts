// The perfect layouts every base is measured against: unit counts by game name
export const perfect = {
    GDI: {
        defense: {
            "GDI_Def_Missile Squad": 23,
            "GDI_Def_Zone Trooper": 23,
            "GDI_Def_Sniper": 7,
        },
        offense: {
            "GDI_Sniper Team": 4,
            "GDI_Mammoth": 4,
            "GDI_Orca": 2,
            "GDI_Paladin": 2,
            "GDI_Zone Trooper": 1,
            "GDI_Kodiak": 1,
            "GDI_Juggernaut": 1,
            "GDI_Commando": 1,
            "GDI_Riflemen": 1,
            "GDI_Firehawk": 1,
        },
    },
    NOD: {
        defense: {
            "NOD_Def_Militant Rocket Soldiers": 28,
            "NOD_Def_Black Hand": 9,
            "NOD_Def_Confessor": 7,
        },
        offense: {
            "NOD_Avatar": 4,
            "NOD_Confessor": 3,
            "NOD_Specter Artilery": 2,
            "NOD_Venom": 2,
            "NOD_Cobra": 2,
            "NOD_Militants": 1,
            "NOD_Black Hand": 1,
            "NOD_Salamander": 1,
            "NOD_Commando": 1,
            "NOD_Vertigo": 1,
        },
    },
} as const;
