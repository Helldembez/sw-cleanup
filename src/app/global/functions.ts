import { Properties, Stat } from "./models";

function MROUND(number, roundto) {
    return roundto * Math.round(number / roundto);
}

function ROUND(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
};

function getProperties(): Properties {
    let test = window.localStorage.getItem("properties")
    if (!test) {
        window.localStorage.setItem("properties", JSON.stringify(new Properties(), (key, value) => {
            if (value instanceof Map) {
                return {
                    dataType: 'Map',
                    value: Array.from(value.entries()),
                };
            } else {
                return value;
            }
        }))
    }

    let properties: Properties = JSON.parse(window.localStorage.getItem("properties"), (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    })

    return properties
}

function flatStatToPercStat(stat: Stat) {
    switch (stat) {
        case Stat["Atk+"]: return Stat["Atk%"]
        case Stat["Def+"]: return Stat["Def%"]
        case Stat["HP+"]: return Stat["HP%"]
    }
}

function isFlatStat(stat: Stat): Boolean {
    return [Stat["Atk+"], Stat["Def+"], Stat["HP+"]].includes(stat)
}

export { MROUND, ROUND, getProperties, flatStatToPercStat, isFlatStat }