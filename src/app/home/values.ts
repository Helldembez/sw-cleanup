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

const valuesForStat: Map<Stat, Array<number>> = new Map([
    [Stat["Acc%"], [64, -13]],
    [Stat["Atk+"], [160, -25]],
    [Stat["Atk%"], [0.63, -0.12]],
    [Stat["CtR%"], [58, -11]],
    [Stat["CtD%"], [80, -15]],
    [Stat["Def+"], [160, 25]],
    [Stat["Def%"], [0.63, -0.12]],
    [Stat["HP+"], [2448, -360]],
    [Stat["HP%"], [0.63, -0.12]],
    [Stat["Res%"], [64, -13]],
    [Stat.Spd, [42, -3]]
])

const minMaxForStat: Map<Stat, Array<number>> = new Map([
    [Stat["Acc%"], [4, 8]],
    [Stat["Atk+"], [10, 20]],
    [Stat["Atk%"], [5, 8]],
    [Stat["CtR%"], [4, 6]],
    [Stat["CtD%"], [4, 7]],
    [Stat["Def+"], [10, 20]],
    [Stat["Def%"], [5, 8]],
    [Stat["HP+"], [135, 375]],
    [Stat["HP%"], [5, 8]],
    [Stat["Res%"], [4, 8]],
    [Stat.Spd, [4, 6]]
])

const maxRollsForStat: Map<Stat, Array<number>> = new Map([
    [Stat["Acc%"], [8, 40]],
    [Stat["Atk+"], [50, 130]],
    [Stat["Atk%"], [18, 50]],
    [Stat["CtR%"], [6, 30]],
    [Stat["CtD%"], [7, 35]],
    [Stat["Def+"], [50, 130]],
    [Stat["Def%"], [18, 50]],
    [Stat["HP+"], [925, 2425]],
    [Stat["HP%"], [18, 50]],
    [Stat["Res%"], [8, 40]],
    [Stat.Spd, [11, 35]]
])

const minMaxForGrind: Map<Stat, Array<number>> = new Map([
    [Stat["Acc%"], [0, 0]],
    [Stat["Atk+"], [12, 22]],
    [Stat["Atk%"], [4, 7]],
    [Stat["CtR%"], [0, 0]],
    [Stat["CtD%"], [0, 0]],
    [Stat["Def+"], [12, 22]],
    [Stat["Def%"], [4, 7]],
    [Stat["HP+"], [230, 450]],
    [Stat["HP%"], [4, 7]],
    [Stat["Res%"], [0, 0]],
    [Stat.Spd, [3, 4]]
])

const minMaxForGem: Map<Stat, Array<number>> = new Map([
    [Stat["Acc%"], [6, 9]],
    [Stat["Atk+"], [20, 30]],
    [Stat["Atk%"], [7, 11]],
    [Stat["CtR%"], [4, 7]],
    [Stat["CtD%"], [5, 8]],
    [Stat["Def+"], [20, 30]],
    [Stat["Def%"], [7, 11]],
    [Stat["HP+"], [290, 420]],
    [Stat["HP%"], [7, 11]],
    [Stat["Res%"], [6, 9]],
    [Stat.Spd, [5, 8]]
])

const avgBaseForStatPerType: Map<MonsterType, Map<Stat, number>> = new Map(
    [
        [
            MonsterType.Attack,
            new Map([
                [Stat["HP%"], 9669],
                [Stat["Atk%"], 802],
                [Stat["Def%"], 564],
                [Stat.Spd, 104],
                [Stat["Res%"], 16],
                [Stat["Acc%"], 3],
                [Stat["CtR%"], 17],
                [Stat["CtD%"], 50]
            ])
        ],
        [MonsterType.Support,
        new Map([
            [Stat["HP%"], 10817],
            [Stat["Atk%"], 631],
            [Stat["Def%"], 637],
            [Stat.Spd, 104],
            [Stat["Res%"], 20],
            [Stat["Acc%"], 3],
            [Stat["CtR%"], 15],
            [Stat["CtD%"], 50]
        ])
        ],
        [MonsterType.Defense,
        new Map([
            [Stat["HP%"], 10125],
            [Stat["Atk%"], 582],
            [Stat["Def%"], 733],
            [Stat.Spd, 102],
            [Stat["Res%"], 18],
            [Stat["Acc%"], 5],
            [Stat["CtR%"], 16],
            [Stat["CtD%"], 50]
        ])
        ],
        [MonsterType.Hp,
        new Map([
            [Stat["HP%"], 11821],
            [Stat["Atk%"], 650],
            [Stat["Def%"], 584],
            [Stat.Spd, 104],
            [Stat["Res%"], 18],
            [Stat["Acc%"], 4],
            [Stat["CtR%"], 16],
            [Stat["CtD%"], 50]
        ])
        ],
        [MonsterType.All,
        new Map([
            [Stat["HP%"], 10364],
            [Stat["Atk%"], 711],
            [Stat["Def%"], 603],
            [Stat.Spd, 104],
            [Stat["Res%"], 17],
            [Stat["Acc%"], 4],
            [Stat["CtR%"], 16],
            [Stat["CtD%"], 50]
        ])
        ]
    ]
)

const flatStatsForStat: Map<Stat, number> = new Map([
    [Stat["HP%"], 2448],
    [Stat["Atk%"], 160],
    [Stat["Def%"], 160],
    [Stat.Spd, 0],
    [Stat["Res%"], 0],
    [Stat["Acc%"], 0],
    [Stat["CtR%"], 0],
    [Stat["CtD%"], 0]
])

const allStats: Array<Stat> = [Stat["HP%"], Stat["HP+"], Stat["Atk%"], Stat["Atk+"], Stat["Def%"], Stat["Def+"], Stat.Spd, Stat["CtD%"], Stat["CtR%"], Stat["Res%"], Stat["Acc%"]]
const statsInSlot: Map<Slot, number> = new Map([
    [Slot.ONE, 9],
    [Slot.TWO, 4],
    [Slot.THREE, 9],
    [Slot.FOUR, 5],
    [Slot.FIVE, 11],
    [Slot.SIX, 5],
])

const grindGemTable: Map<Number, number> = new Map([
    [4, 0],
    [3, 0.5],
    [2, 0.75],
    [1, 1]
])

export { valuesForStat, minMaxForStat, maxRollsForStat, flatStatsForStat, avgBaseForStatPerType, minMaxForGrind, minMaxForGem, grindGemTable, statsInSlot, allStats, Stat, RuneSet, Slot, MonsterType, Action }