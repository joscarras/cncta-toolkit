import type { Api, City } from "/addon/api.js";

function fail( message: string ): never {
    throw new Error(`${ message }` );
}

function alliance( city: City ) {
    return {
        id: city.get_AllianceId(),
        name: city.get_AllianceName()
    };
}

function coords( city: City ) {
    return {
        x: city.get_X(),
        y: city.get_Y()
    };
}

function owner( api: Api, city: City ) {
    return api.player.id === city.get_OwnerId() ? api.player : fail( "Invalid owner" );
}

function cast( api: Api, city: City ) {
    return {
        get alliance() { return alliance(city); },
        get coords() { return coords(city); },
        get faction() { return city.get_CityFaction(); },
        get id() { return city.get_Id(); },
        get level() { return city.get_BaseLevel(); },
        get name() { return city.get_Name(); },
        get owner() { return owner(api, city); },
        get raw() { return city },
        get type () { return "city" as const; },
    };
}

export function cities( api: Api ) {
    return api.allCities.map( city => cast(api, city) );
}

export function active( api: Api ) {
    return cast( api, api.activeCity );
}