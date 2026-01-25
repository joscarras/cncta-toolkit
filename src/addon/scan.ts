import type { Api, Object, Coords } from "/addon/api.js";
import { cities } from "/addon/player.js";
import { defRow, gridCols, gridRows, gridSize, offRow } from "/defaults.js";
import { empty, tech, defense , offense, type Unit, terrain } from "/addon/units.js";

export type City = ReturnType<typeof cast>;
export type Grid = Array<Tile>;
export type Tile = [unit: Unit, level: number, raw?: any];

function notLoaded( id: number ): never {
    throw new Error(`City ${ id } is not loaded`);
}

function delay( ms: number ) {
    return new Promise( resolve => setTimeout( resolve, ms ) );
}

function cast( api: Api, object: Object, x: number, y: number, distance: number ) {
    const { info: { keys } } = api;
    const type = getType( api, object.Type );
    const id = object[keys[`${ type }Id` as Keys]] as number;
    
    type Keys = keyof typeof keys;

    let city = api.city(id);
    let grid: Grid|null = null;

    return {
        get alliance() { return getAlliance( api, this ); },
        get coords() { return { x, y }; },
        get data() { return city ??= api.city( id ) ?? notLoaded( id ); },
        get distance() { return api.distance( this.coords ); },
        get faction() { return city?.get_CityFaction(); },
        get grid() { return grid ??= getGrid( api, this ); },
        get id() { return id; },
        get level() { return object[keys[`${ type }Level` as Keys]] as number; },
        get levels() { return getLevels( this ); },
        get loaded() { return city || api.has( id ); },
        get hash() { return `${ type === "city" ? "c" : "" }${id}-${x}:${y}`; },
        get loot() { return getLoot( api, this ); },
        get name() { return city?.get_Name(); },
        get object() { return object; },
        get owner() { return getOwner( api, this ); },
        get packages() { return getPackages( api, this ); },
        get production() { return getProduction( api, this ); },
        get resources() { return getResources( api, this ); },
        get storage() { return getStorage( api, this ); },
        get type () { return type; },
        load() { return this.loaded ? this : load( api, this ); },
    };
}

async function load( api: Api, city: City ) {
    const { id } = city;
    
    let tries = 0;
    
    api.select(id);
    api.city(id);
    
    while ( !city.loaded ) {
        if ( tries > 20 ) throw new Error(`Failed to load city ${ id }`);
        else if ( tries > 15 ) { await delay(750); }
        else if ( tries > 10 ) { await delay(500); }
        else if ( tries > 4 ) { await delay(250); }
        else { await delay(150); }

        // @note Try to see if the selected city is already loaded
        // api.select(id);
        api.city(id);
        tries += 1;
    }

    // Re-fetch the city now that it's loaded
    return city.data ? city : notLoaded( id );
}

function getType( { info: { types: { Object } } }: Api, type?: number ) {
    switch( type ) {
        case Object.City: return "city";
        case Object.FreeSlot: return "free-slot";
        case Object.Marker: return "marker";
        case Object.NPCBase: return "base";
        case Object.NPCCamp: return "camp";
        case Object.NewPlayerSlot: return "player-slot";
        case Object.None : return "none";
        case Object.Outpost: return "outpost";
        case Object.PointOfInterest: return "poi";
        case Object.Ruin: return "ruin";
        default: return "unknown";
    }
}

function getAlliance( { info: { player, alliance } }: Api, city: City ) {
    if ( city.data.get_OwnerId() === player.id ) return alliance;

    return {
        id: city.data.get_OwnerAllianceId(),
        name: city.data.get_OwnerAllianceName()
    };
}

function getGrid( { game, info: { keys } }: Api, city: City ) {
    const layout: Grid = new Array( gridSize );
    const units = city.data.get_CityUnitsData();

    for ( let row = 0; row < gridRows; row++ ) {
        for ( let col = 0; col < gridCols; col++ ) {
            const type = city.data.GetResourceType( col, row );
            const index = row * gridCols + col;

            switch ( type ) {
                case 0: layout[index] = [empty, 0]; break; // @note Empty space
                case 1: layout[index] = [terrain.Crystal, 0]; break; // @note Crystal
                case 2: layout[index] = [terrain.Tiberium, 0]; break; // @note Tiberium
                case 4: layout[index] = [terrain.Woods, 0]; break; // @note Woods
                case 5: layout[index] = [terrain.Scrub, 0]; break; // @note Scrub
                case 6: layout[index] = [terrain.Oil, 0]; break; // @note Oil
                case 7: layout[index] = [terrain.Swamp, 0]; break; // @note Swamp
                default: throw new Error(`Unknown type ${type} at [${col}, ${row}]`);
            }
        }
    }

    for ( const unit of Object.values(city.data.get_Buildings().d) as any[] ) {
        const level = unit.get_CurrentLevel();
        const key = game.Tech[unit.get_MdbBuildingId()].n;
        const type = tech[key as keyof typeof tech];
        const row = unit.get_CoordY();
        const col = unit.get_CoordX();

        if ( type && row >= 0 && col >= 0 ) {
            layout[row * gridCols + col] = [type, level, unit];
        }
    }

    for ( const unit of Object.values(units[keys.defenseId].d) as any[] ) {
        const level = unit.get_CurrentLevel();
        const key = unit.get_UnitGameData_Obj().n;
        const type = defense[key as keyof typeof defense];
        const row = unit.get_CoordY() + defRow;
        const col = unit.get_CoordX();
        
        if ( type && row >= 0 && col >= 0 ) {
            layout[row * gridCols + col] = [type, level, unit];
        }
    }

    for ( const unit of Object.values(units[keys.offenseId].d) as any[] ) {
        const level = unit.get_CurrentLevel();
        const key = unit.get_UnitGameData_Obj().n;
        const type = offense[key as keyof typeof offense];
        const row = unit.get_CoordY() + offRow;
        const col = unit.get_CoordX();
        
        if ( type && row >= 0 && col >= 0 ) {
            layout[row * gridCols + col] = [type, level, unit];
        }
    }

    return layout;
}

function getLevels( { data }: City ) {
    return {
        base: data.get_LvlBase(),
        defense: data.get_LvlDefense(),
        offense: data.get_LvlOffense(),
    }
}

function getLoot( { info: { types: { Resource } } }: Api, city: City) {
    const loot = { tiberium: 0, crystal: 0, credits: 0, research: 0 };
    const { Tiberium, Crystal, Gold, ResearchPoints } = Resource;

    for (const [,,unit] of city.grid) {
        const value = unit?.get_HitpointsPercent();

        if ( unit && value ) {
            for( const { Type, Count } of unit.get_UnitLevelRepairRequirements() ?? [] ) {
                if ( Count ) {
                    switch( Type ) {
                        case Tiberium: loot.tiberium += Count * value; break;
                        case Crystal: loot.crystal  += Count * value; break;
                        case Gold: loot.credits  += Count * value; break;
                        case ResearchPoints: loot.research += Count * value; break;
                    }
                }
            }
        }
    }

    return loot;
}

function getOwner( { info: { player } }: Api, city: City ) {
    if ( city.data.get_OwnerId() === player.id ) return player;

    return {
        id: city.data.get_OwnerId(),
        name: city.data.get_OwnerName()
    };
}

function getPackages( { info: { types: { Resource } } }: Api, { data }: City ) {
    return {
        power: data.GetResourceBonusGrowPerHour( Resource.Power! ),
        crystal: data.GetResourceBonusGrowPerHour( Resource.Crystal! ),
        tiberium: data.GetResourceBonusGrowPerHour( Resource.Tiberium! ),
        credits: data.GetResourceBonusGrowPerHour( Resource.Gold! ),
    };
}

function getProduction( { info: { types: { Resource } } }: Api, { data }: City ) {
    return {
        power: data.GetResourceGrowPerHour( Resource.Power! ),
        crystal: data.GetResourceGrowPerHour( Resource.Crystal! ),
        tiberium: data.GetResourceGrowPerHour( Resource.Tiberium! ),
        credits: data.GetResourceGrowPerHour( Resource.Gold! ),
    };
}

function getResources( { info: { types: { Resource } } }: Api, { data }: City ) {
    return {
        power: data.GetResourceCount( Resource.Power! ),
        crystal: data.GetResourceCount( Resource.Crystal! ),
        tiberium: data.GetResourceCount( Resource.Tiberium! ),
    };
}

function getStorage( { info: { types: { Resource } } }: Api, { data }: City ) {
    return {
        power: data.GetResourceMaxStorage( Resource.Power! ),
        crystal: data.GetResourceMaxStorage( Resource.Crystal! ),
        tiberium: data.GetResourceMaxStorage( Resource.Tiberium! ),
    };
}

export function* coords( api: Api, coords: Coords, radius = api.info.server.attack ) {
    const { info: { types: { Object, Camp: { Destroyed } }, keys: { campType } } } = api;
    const max = Math.floor(radius + 1);
    const valid = new Set([Object.City, Object.NPCBase, Object.NPCCamp]);

    // Scan in a square around the coordinates
    for (let y = coords.y - max; y <= coords.y + max; y++) {
        for (let x = coords.x - max; x <= coords.x + max; x++) {
            // Calculate actual distance
            const diffX = Math.abs(coords.x - x);
            const diffY = Math.abs(coords.y - y);
            const distance = Math.sqrt((diffX * diffX) + (diffY * diffY));
            
            // Skip if outside the distance range
            if (distance <= radius) {
                const object = api.object(x, y);
                const type = object?.Type as string | undefined;

                if ( object && type && valid.has( type ) ) {
                    if ( type !== Object.NPCCamp || object[campType] !== Destroyed ) {
                        yield cast( api, object!, x, y, distance );
                    }
                }
            }            
        }
    }
}

export function* world( api: Api, radius?: number ) {
    for ( const city of cities( api ) ) {
        api.select( city.id );
        api.center( city.coords );
        
        yield* coords( api, city.coords, radius );
    }
}
