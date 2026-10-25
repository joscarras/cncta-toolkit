import * as Tools from "/addon/tools.ts";
import type { Api, City } from "/addon/api.ts";
import { perfect } from "/addon/perfect.ts";

type Faction = keyof typeof perfect;
type Placement = "defense" | "offense";

const storage = "cncta_tools_sheet_url";
const maxLevel = 65;
const factions: Record<number, Faction> = { 1: "GDI", 2: "NOD" };

function fail( message: string ): never {
    throw new Error( message );
}

// Power to upgrade a unit to this level; level 1 is the cost to place it
function power( api: Api, data: unknown, level: number ) {
    const { Power } = api.info.types.Resource;
    const costs = api.util.GetUnitLevelResourceRequirements_Obj( level, data ) ?? [];
    return costs.find( ( { Type }: { Type: number } ) => Type === Power )?.Count ?? 0;
}

function spent( api: Api, data: unknown, level: number ) {
    let sum = 0;

    for ( let current = 1; current <= level; current += 1 ) {
        sum += power( api, data, current );
    }

    return sum;
}

function unitData( api: Api, name: string ) {
    const resources = api.client.Res.ResMain.GetInstance();

    for ( const [id, unit] of Object.entries( api.game.units ) as [string, { n: string }][] ) {
        if ( unit.n === name ) return resources.GetUnit_Obj( parseInt( id, 10 ) );
    }

    return fail( `Unit "${ name }" not found` );
}

function target( api: Api, faction: Faction, placement: Placement ) {
    let sum = 0;

    for ( const [name, count] of Object.entries( perfect[faction][placement] ) ) {
        sum += spent( api, unitData( api, name ), maxLevel ) * count;
    }

    return sum;
}

function current( api: Api, city: City, placement: Placement ) {
    const { defenseId, offenseId } = api.info.keys;
    const units = city.get_CityUnitsData()[placement === "defense" ? defenseId : offenseId].d;
    let sum = 0;

    for ( const unit of Object.values( units ) as any[] ) {
        sum += spent( api, unit.get_UnitGameData_Obj(), unit.get_CurrentLevel() );
    }

    return sum;
}

function days( needed: number, daily: number ) {
    return daily > 0 ? Math.round( Math.max( 0, needed ) / daily * 10 ) / 10 : null;
}

function row( api: Api, city: City, targets: Record<Faction, Record<Placement, number>> ) {
    const { Power } = api.info.types.Resource;
    const faction = factions[city.get_CityFaction()] ?? fail( `Unknown faction of ${ city.get_Name() }` );
    const hourly = city.GetResourceGrowPerHour( Power, false, false )
        + city.GetResourceBonusGrowPerHour( Power )
        + api.info.bonus.power;
    const daily = hourly * 24;
    const stored = city.GetResourceCount( Power );
    const max = city.GetResourceMaxStorage( Power );
    const defense = { spent: current( api, city, "defense" ), target: targets[faction].defense };
    const army = { spent: current( api, city, "offense" ), target: targets[faction].offense };
    const defenseNeeded = Math.max( 0, defense.target - defense.spent );
    const armyNeeded = Math.max( 0, army.target - army.spent );

    return {
        account: api.info.player.name,
        base: city.get_Name(),
        faction,
        level: city.get_LvlBase(),
        offense: city.get_LvlOffense(),
        defense: city.get_LvlDefense(),
        hourly: Math.round( hourly ),
        stored: Math.round( stored ),
        max: Math.round( max ),
        daysToFull: days( max - stored, daily ),
        defensePercent: defense.spent / defense.target,
        armyPercent: army.spent / army.target,
        defenseNeeded: Math.round( defenseNeeded ),
        armyNeeded: Math.round( armyNeeded ),
        daysToDefense: days( defenseNeeded - stored, daily ),
        daysToTarget: days( defenseNeeded + armyNeeded - stored, daily ),
    };
}

export function rows( api: Api ) {
    const targets = {
        GDI: { defense: target( api, "GDI", "defense" ), offense: target( api, "GDI", "offense" ) },
        NOD: { defense: target( api, "NOD", "defense" ), offense: target( api, "NOD", "offense" ) },
    };

    return api.allCities.map( city => row( api, city, targets ) );
}

async function getUrl( ask: boolean ) {
    const stored = await Tools.get<string>( storage, "" );

    if ( stored && !ask ) return stored;

    const url = prompt( "Paste your Google Sheet web app URL", stored )?.trim();

    if ( !url ) return fail( "No sheet URL" );

    await Tools.set( { [storage]: url } );
    return url;
}

// Sends this account's bases; shift-click asks for the sheet URL again
export async function update( api: Api, ask = false ) {
    const url = await getUrl( ask );
    const body = JSON.stringify( { account: api.info.player.name, rows: rows( api ) } );

    return Tools.post<{ count: number }>( url, body );
}
