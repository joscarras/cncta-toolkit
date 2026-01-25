declare global {
    var wrappedJSObject: any;
}

export type Coords = { x: number; y: number };

export interface Object {
[key: string]: unknown;
    Type: 1 | 2 | 3 | 7;
}

export interface City {
    CalculateAttackCommandPointCostToCoord( x: number, y: number ): number;
    GetResourceBonusGrowPerHour( type: string ): number;
    GetResourceCount( type: string ): number;
    GetResourceGrowPerHour( type: string ): number;
    GetResourceMaxStorage( type: string ): number;
    GetResourceType( col: number, row: number ): number;
    [key: string]: unknown;
    get_AllianceId(): number;
    get_AllianceName(): string;
    get_BaseLevel(): number;
    get_Buildings(): any;
    get_CityFaction(): number;
    get_CityUnitsData(): any;
    get_Id(): number;
    get_LvlBase(): number;
    get_LvlDefense(): number;
    get_LvlOffense(): number;
    get_Name(): string;
    get_OwnerAllianceId(): number;
    get_OwnerAllianceName(): string;
    get_OwnerId(): number;
    get_OwnerName(): string;
    get_X(): number;
    get_Y(): number;
}

export interface Entity {
    id: number;
    name: string;
}

const global = globalThis.wrappedJSObject ?? globalThis;
const storage = "cncta_tools_cache";
const cache: Record<number, City> = global.eval( `window.${ storage } ??= {}` );

function fail(method: string ): never {
    throw new Error( `Api::${ method }: Failed to load data` );
}

function getInfo( { client, server, player, alliance }: Api ) {
    const { Data, Base: { EResourceType }, Vis: { Region } } = client;
    const RegionCity = Region.RegionCity.prototype;
    const RegionBase = Region.RegionNPCBase.prototype;
    const RegionCamp = Region.RegionNPCCamp.prototype;
    const CityUnits = Data.CityUnits.prototype;
    const City = Data.City.prototype;

    const region = /return this\.[A-Z]{6}\.([A-Z]{6})/;
    const dataKey = /for ?\(.+[a-z]:this.([A-Z]{6}).+[a-z]:this.([A-Z]{6})/;
    const cityKey = /return this\.([A-Z]{6})!=null/;

    return {
        alliance: {
            id: alliance.get_Id(),
            name: alliance.get_Name()
        },
        bonus: {
            crystal: alliance.GetPOIBonusFromResourceType( EResourceType.Crystal! ),
            power: alliance.GetPOIBonusFromResourceType( EResourceType.Power! ),
            tiberium: alliance.GetPOIBonusFromResourceType( EResourceType.Tiberium! )
        },
        keys: {
            baseId: RegionBase.get_Id.toString().match( region )[1] as string,
            ruinId: "void", // @note Probably is EELCZO
            baseLevel: RegionBase.get_BaseLevel.toString().match( region )[1] as string,
            baseType: "void", // @note Does not exists for base
            campId: RegionCamp.get_Id.toString().match( region )[1] as string,
            campLevel: RegionCamp.get_BaseLevel.toString().match( region )[1] as string,
            campType: RegionCamp.get_CampType.toString().match( region )[1] as string,
            cityId: RegionCity.get_Id.toString().match( region )[1] as string,
            cityLevel: RegionCity.get_BaseLevel.toString().match( region )[1] as string,
            cityType: "void", // @note Does not exists for city
            ruinType: "void", // @note Does not exists for ruin
            ruinLevel: "void", // @note Probably is XDJHZO
            defenseId: CityUnits.HasUnitMdbId.toString().match( dataKey )[2] as string,
            gridKey: City.IsPosOccupied.toString().match( cityKey )[1] as string,
            offenseId: CityUnits.HasUnitMdbId.toString().match( dataKey )[1] as string,
        },
        player : {
            id: player.get_Id(),
            name: player.get_Name()
        },
        server: {
            id: server.get_WorldId(),
            attack: server.get_MaxAttackDistance(),
            name: server.get_Name(),
            tech: server.get_TechLevelUpgradeFactorBonusAmount(),
        },
        types: {
            Camp: Data.Reports.ENPCCampType,
            Object: Data.WorldSector.ObjectType,
            Resource: EResourceType,
        },
    };
}

function isLoaded( city: City ): city is City {
    if ( !city?.get_BaseLevel() ) return false;
    if ( !Object.values( city.get_Buildings()?.d ?? {} ).length ) return false;
    if ( !city.get_Name() ) return false;
    if ( !city.get_CityFaction() ) return false;
    return true;
}

export class Api {
    // public readonly player: Entity;
    // public readonly alliance: Entity;
    
    public readonly alliance: any;
    public readonly cities: any;
    public readonly client: any = global.eval("ClientLib");
    public readonly game: any = global.eval("GAMEDATA");
    public readonly player: any;
    public readonly server: any;
    public readonly util: any;
    public readonly vis: any;
    public readonly world: any;
    public readonly info: ReturnType<typeof getInfo>;
    
    public constructor() {
        const { client } = this;
        const data = this.client.Data;
        const instance = data.MainData.GetInstance();

        this.alliance = instance.get_Alliance();
        this.cities = instance.get_Cities();
        this.player = instance.get_Player();
        this.server = instance.get_Server();
        this.util = client.Base.Util;
        this.vis = client.Vis.VisMain.GetInstance();
        this.world = instance.get_World();
        this.info = getInfo( this );
    }

    get allCities(): City[] {
        const cities = this.cities.get_AllCities().d ?? fail( "allCities" );
        return Object.values( cities )
    }

    get activeCity(): City {
        return this.cities.get_CurrentOwnCity?.() ?? fail( "activeCity" );
    }

    get coords(): Coords {
        const city = this.activeCity;
        return { x: city.get_X(), y: city.get_Y() };
    }

    public validate() {
        for ( const [key, value] of Object.entries( this ) ) {
            if ( !value ) throw new Error( `Api::validate: Missing property ${ key }` );
        }

        return this;
    }

    public has( id: number ): boolean {
        return !!cache[id];
    }

    public object( x: number, y: number ): Object | null {
        return this.world.GetObjectFromPosition( x, y ) ?? null;
    }

    public center( coords: Coords = this.coords ) {
        this.vis.CenterGridPosition( coords.x, coords.y );
        this.vis.Update();
        this.vis.ViewUpdate();
    }

    public select( id: number ) {
        this.cities.set_CurrentCityId( id );
    }

    public distance( { x, y }: Coords ): number {
        return this.activeCity.CalculateAttackCommandPointCostToCoord( x, y );
    }

    public city( id: number ): City | null {
        if( cache[id] ) return cache[id];
        
        const city = this.cities.GetCity(id);

        if ( !city || !isLoaded(city) ) return null;

        cache[id] = city;
        
        return city;
    }
}

export async function init() {
    let tries = 0;

    while ( true ) {
        try {
            return new Api().validate();
        }
        catch (error) {
            if ( tries > 10 ) throw error;

            tries +=1;
                        
            await new Promise( resolve => setTimeout( resolve, 200 ) );
        }
    }
}