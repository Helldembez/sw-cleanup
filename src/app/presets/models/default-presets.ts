import { BuildType, MonsterType, PrimaryStat, RuneSet, Slot, Stat } from "../../global/models"
import { Preset } from "./preset"

const PRESETS = new Map([
  [BuildType["Fast DD"], new Preset(
    BuildType["Fast DD"],
    MonsterType.Attack,
    new PrimaryStat(true, false, false),
    [RuneSet.Blade, RuneSet.Fight, RuneSet.Nemesis, RuneSet.Rage, RuneSet.Vampire, RuneSet.Violent, RuneSet.Will],
    [RuneSet.Fatal, RuneSet.Focus, RuneSet.Shield, RuneSet.Swift, RuneSet.Despair],
    new Map([
      [Slot.TWO, [Stat["Atk%"], Stat.Spd]],
      [Slot.FOUR, [Stat["CtD%"]]],
      [Slot.SIX, [Stat["Atk%"]]],
    ]),
    new Map([
      [Slot.TWO, []],
      [Slot.FOUR, []],
      [Slot.SIX, []],
    ]),
    new Map([
      [Stat["HP%"], 15042],
      [Stat["Atk%"], 2500],
      [Stat["Def%"], 814],
      [Stat.Spd, 215],
      [Stat["Res%"], 0],
      [Stat["Acc%"], 25],
      [Stat["CtR%"], 90],
      [Stat["CtD%"], 175]
    ])
  )
  ],
  [BuildType["Slow DD"], new Preset(
    BuildType["Slow DD"],
    MonsterType.Attack,
    new PrimaryStat(true, false, false),
    [RuneSet.Fight, RuneSet.Shield, RuneSet.Rage, RuneSet.Violent, RuneSet.Will],
    [RuneSet.Fatal, RuneSet.Blade, RuneSet.Vampire, RuneSet.Swift, RuneSet.Despair],
    new Map([
      [Slot.TWO, [Stat["Atk%"]]],
      [Slot.FOUR, [Stat["CtD%"]]],
      [Slot.SIX, [Stat["Atk%"]]],
    ]),
    new Map([
      [Slot.TWO, []],
      [Slot.FOUR, []],
      [Slot.SIX, []],
    ]),
    new Map([
      [Stat["HP%"], 15042],
      [Stat["Atk%"], 2700],
      [Stat["Def%"], 814],
      [Stat.Spd, 150],
      [Stat["Res%"], 0],
      [Stat["Acc%"], 25],
      [Stat["CtR%"], 95],
      [Stat["CtD%"], 200]
    ])
  )],
  [BuildType["Def DD"], new Preset(
    BuildType["Def DD"],
    MonsterType.Defense,
    new PrimaryStat(false, true, false),
    [RuneSet.Determination, RuneSet.Guard, RuneSet.Rage, RuneSet.Vampire, RuneSet.Will],
    [RuneSet.Blade, RuneSet.Fight, RuneSet.Violent],
    new Map([
      [Slot.TWO, [Stat["Def%"]]],
      [Slot.FOUR, [Stat["CtD%"]]],
      [Slot.SIX, [Stat["Def%"]]],
    ]),
    new Map([
      [Slot.TWO, []],
      [Slot.FOUR, []],
      [Slot.SIX, []],
    ]),
    new Map([
      [Stat["HP%"], 14649],
      [Stat["Atk%"], 1000],
      [Stat["Def%"], 2600],
      [Stat.Spd, 175],
      [Stat["Res%"], 0],
      [Stat["Acc%"], 25],
      [Stat["CtR%"], 70],
      [Stat["CtD%"], 200]
    ])
  )],
  [BuildType.Bomber, new Preset(
    BuildType.Bomber,
    MonsterType.Attack,
    new PrimaryStat(true, false, true),
    [RuneSet.Fatal, RuneSet.Violent, RuneSet.Will],
    [RuneSet.Energy, RuneSet.Fight, RuneSet.Focus, RuneSet.Vampire],
    new Map([
      [Slot.TWO, [Stat["Def%"]]],
      [Slot.FOUR, [Stat["CtD%"]]],
      [Slot.SIX, [Stat["Def%"]]],
    ]),
    new Map([
      [Slot.TWO, [Stat["HP%"]]],
      [Slot.FOUR, [Stat["CtR%"]]],
      [Slot.SIX, []],
    ]),
    new Map([
      [Stat["HP%"], 28195],
      [Stat["Atk%"], 2400],
      [Stat["Def%"], 941],
      [Stat.Spd, 215],
      [Stat["Res%"], 0],
      [Stat["Acc%"], 50],
      [Stat["CtR%"], 50],
      [Stat["CtD%"], 0] // TODO: Why is CD 0
    ])
  )],
  [BuildType.Support, new Preset(
    BuildType.Support,
    MonsterType.Support,
    new PrimaryStat(false, true, true),
    [RuneSet.Accuracy, RuneSet.Despair, RuneSet.Focus, RuneSet.Fight, RuneSet.Swift, RuneSet.Violent, RuneSet.Will],
    [RuneSet.Determination, RuneSet.Enhance, RuneSet.Energy, RuneSet.Tolerance, RuneSet.Guard],
    new Map([
      [Slot.TWO, [Stat.Spd]],
      [Slot.FOUR, [Stat["HP%"], Stat["Def%"]]],
      [Slot.SIX, [Stat["Def%"], Stat["HP%"]]],
    ]),
    new Map([
      [Slot.TWO, [Stat["HP%"]]],
      [Slot.FOUR, [Stat["Atk%"]]],
      [Slot.SIX, [Stat["Atk%"], Stat["Acc%"]]],
    ]),
    new Map([
      [Stat["HP%"], 31335],
      [Stat["Atk%"], 1100],
      [Stat["Def%"], 1042],
      [Stat.Spd, 250],
      [Stat["Res%"], 0],
      [Stat["Acc%"], 65],
      [Stat["CtR%"], 0],
      [Stat["CtD%"], 0]
    ])
  )],
  [BuildType["PvP Def"], new Preset(
    BuildType["PvP Def"],
    MonsterType.Hp,
    new PrimaryStat(false, false, true),
    [RuneSet.Endure, RuneSet.Enhance, RuneSet.Fight, RuneSet.Shield, RuneSet.Tolerance, RuneSet.Violent, RuneSet.Will],
    [RuneSet.Despair, RuneSet.Destroy, RuneSet.Determination, RuneSet.Energy, RuneSet.Revenge, RuneSet.Vampire],
    new Map([
      [Slot.TWO, [Stat["HP%"], Stat.Spd]],
      [Slot.FOUR, [Stat["HP%"]]],
      [Slot.SIX, [Stat["HP%"]]],
    ]),
    new Map([
      [Slot.TWO, [Stat["Def%"]]],
      [Slot.FOUR, [Stat["Def%"]]],
      [Slot.SIX, [Stat["Def%"]]],
    ]),
    new Map([
      [Stat["HP%"], 43860],
      [Stat["Atk%"], 0],
      [Stat["Def%"], 1303],
      [Stat.Spd, 200],
      [Stat["Res%"], 75],
      [Stat["Acc%"], 25],
      [Stat["CtR%"], 0],
      [Stat["CtD%"], 0]
    ])
  )],
  [BuildType.Bruiser, new Preset(
    BuildType.Bruiser,
    MonsterType.All,
    new PrimaryStat(true, false, true),
    [RuneSet.Blade, RuneSet.Fight, RuneSet.Shield, RuneSet.Vampire, RuneSet.Violent, RuneSet.Will],
    [RuneSet.Blade, RuneSet.Destroy, RuneSet.Energy, RuneSet.Rage, RuneSet.Revenge, RuneSet.Despair],
    new Map([
      [Slot.TWO, [Stat["HP%"], Stat.Spd, Stat["Atk%"]]],
      [Slot.FOUR, [Stat["CtD%"]]],
      [Slot.SIX, [Stat["HP%"], Stat["Atk%"]]],
    ]),
    new Map([
      [Slot.TWO, [Stat["Def%"]]],
      [Slot.FOUR, [Stat["CtR%"]]],
      [Slot.SIX, [Stat["Def%"]]],
    ]),
    new Map([
      [Stat["HP%"], 28195],
      [Stat["Atk%"], 1800],
      [Stat["Def%"], 941],
      [Stat.Spd, 215],
      [Stat["Res%"], 0],
      [Stat["Acc%"], 25],
      [Stat["CtR%"], 75],
      [Stat["CtD%"], 150]
    ])
  )],
])

function getPresets(): Map<BuildType, Preset> {
  let test = window.localStorage.getItem("presets")
  if (!test) {
      window.localStorage.setItem("presets", JSON.stringify(PRESETS, (key, value) => {
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

  let presets: Map<BuildType, Preset> = JSON.parse(window.localStorage.getItem("presets"), (key, value) => {
      if (typeof value === 'object' && value !== null) {
          if (value.dataType === 'Map') {
              return new Map(value.value);
          }
      }
      return value;
  })

  return presets
}

export { getPresets }