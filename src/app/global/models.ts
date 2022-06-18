enum RuneSet {
    Energy = 1,
    Guard = 2,
    Swift = 3,
    Blade = 4,
    Rage = 5,
    Focus = 6,
    Endure = 7,
    Fatal = 8,
    Despair = 10,
    Vampire = 11,
    Violent = 13,
    Nemesis = 14,
    Will = 15,
    Shield = 16,
    Revenge = 17,
    Destroy = 18,
    Fight = 19,
    Determination = 20,
    Enhance = 21,
    Accuracy = 22,
    Tolerance = 23,
    Immemoral = 99
}

enum Stat {
    EMPTY,
    "HP+",
    "HP%",
    "Atk+",
    "Atk%",
    "Def+",
    "Def%",
    "Spd" = 8,
    "CtR%",
    "CtD%",
    "Res%",
    "Acc%",
}

enum Slot {
    ONE = 1, TWO, THREE, FOUR, FIVE, SIX
}

enum MonsterType {
    Attack,
    Support,
    Defense,
    Hp,
    All
}

enum Action {
    KEEP,
    SELL,
    POWERUP
}

enum BuildType {
    "Fast DD",
    "Slow DD",
    "Def DD",
    "Bomber",
    "Support",
    "PvP Def",
    "Bruiser"
}

class PrimaryStat {
    ATK: Boolean
    DEF: Boolean
    HP: Boolean

    constructor(atk: Boolean, def: Boolean, hp: Boolean) {
        this.ATK = atk
        this.DEF = def
        this.HP = hp
    }

    valueForStat(stat: Stat): Boolean {
        switch (stat) {
            case Stat["HP%"]: return this.HP
            case Stat["Atk%"]: return this.ATK
            case Stat["Def%"]: return this.DEF
        }
    }

    amountOfTrue(): number {
        return Number(this.ATK) + Number(this.HP) + Number(this.DEF)
    }
}

class StatPriority {
    bestStat: Stat
    secondary: Stat
    tetriary: Stat
    quaternary: Stat
    innate: Stat
    excluded: Stat

    constructor(bestStat: Stat, secondary: Stat, tetriary: Stat, quaternary: Stat, innate: Stat, excluded: Stat) {
        this.bestStat = bestStat
        this.secondary = secondary
        this.tetriary = tetriary
        this.quaternary = quaternary
        this.innate = innate
        this.excluded = excluded
    }
}

class Properties {
    level = 5
    brokenRunes = 4
    powerUp = 5
    gemGrind = 2
    Focus = new Map([
        [BuildType["Fast DD"], 3],
        [BuildType["Slow DD"], 1],
        [BuildType["Def DD"], 1],
        [BuildType.Bomber, 1],
        [BuildType.Support, 3],
        [BuildType["PvP Def"], 1],
        [BuildType.Bruiser, 3]
    ])
    includeEquiped = true
}

export { RuneSet, Stat, Action, Slot, MonsterType, Properties, PrimaryStat, StatPriority, BuildType }