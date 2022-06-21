import { isFlatStat, flatStatToPercStat } from "../../global/functions"
import { allStats } from "../../global/mapping"
import { MonsterType, RuneSet, Slot, Stat, PrimaryStat, StatPriority, BuildType } from "../../global/models"
import { PresetNormalization } from "./preset-normalization"
import { PresetStat } from "./preset-stat"
import { ValueOfPowerGemGrind } from "./value-power-gem-grind"

class Preset {
  type: MonsterType
  preferred_set: Array<RuneSet>
  acceptable_set: Array<RuneSet>
  preferred_slot: Map<Slot, Array<Stat>>
  acceptable_slot: Map<Slot, Array<Stat>>
  primary_stat: PrimaryStat
  stats: Map<Stat, PresetStat> = new Map()
  statsCountForEvenSlots: Map<Slot, Map<Stat, number>>
  statPriority: Map<Slot, StatPriority> = new Map()
  normalize: PresetNormalization
  powerGemGrindValues: Map<Stat, ValueOfPowerGemGrind> = new Map([[Stat.EMPTY, new ValueOfPowerGemGrind(Stat.EMPTY)]])
  build: BuildType


  constructor(buildType: BuildType, type: MonsterType, primary_stat: PrimaryStat, preferred_set: Array<RuneSet>, acceptable_set: Array<RuneSet>, preferred_slot: Map<Slot, Array<Stat>>, acceptable_slot: Map<Slot, Array<Stat>>, stats: Map<Stat, number>) {
    this.build = buildType
    this.type = type
    this.primary_stat = primary_stat
    this.preferred_set = preferred_set
    this.acceptable_set = acceptable_set
    this.preferred_slot = preferred_slot
    this.acceptable_slot = acceptable_slot
    this.countStatsForEvenSlots(this.preferred_slot, this.acceptable_slot)
    this.createValueOfPowerGemGrind()
    this.createStats(stats)
    this.createStatPriority()
    this.normalize = new PresetNormalization(this, buildType)
    allStats.forEach(stat => {
      const parsedStat = isFlatStat(stat) ? flatStatToPercStat(stat) : stat
      const normalizedForStat = isFlatStat(stat) ? 100 * this.stats.get(parsedStat).normalization / this.stats.get(parsedStat).avgBase : this.stats.get(parsedStat).normalization
      this.powerGemGrindValues.get(stat).calculateNormalizationStats(normalizedForStat)
    })


  }

  private createStats(stats: Map<Stat, number>) {
    var allAvgRollsFromSub = 0
    var allAvgRolesPerRune = 0
    stats.forEach((value, stat) => {
      const presetStat = new PresetStat(stat as Stat, value, this.type, this.primary_stat, this.preferred_slot, this.powerGemGrindValues)
      this.stats.set(stat as Stat, presetStat)
      allAvgRollsFromSub += presetStat.needFromSubsAvgRolls
    })
    this.stats.forEach((preset, stat) => {
      preset.constructPart2(allAvgRollsFromSub, this.powerGemGrindValues.get(stat))
      allAvgRolesPerRune += preset.avgRollsPerRune
    })
    this.stats.forEach((preset, stat) =>
      preset.calculateNormalization(allAvgRolesPerRune)
    )
  }

  private createStatPriority() {
    for (let i = 1; i <= 6; i++) {
      const slot = i as Slot
      var excluded: Stat
      switch (slot) {
        case Slot.ONE: excluded = Stat["Def%"]; break;
        case Slot.THREE: excluded = Stat["Atk%"]; break;
        case Slot.FIVE: excluded = Stat.EMPTY; break;
        case Slot.TWO:
        case Slot.FOUR:
        case Slot.SIX:
          excluded = Array.from(this.stats).reduce((norm, [key, value]) => {
            if (Array.from(this.preferred_slot.get(slot)).includes(key)) {
              return value.normalization > norm[1].normalization ? [key, value] : norm
            }
            return norm
          })[0]
          break;
      }
      const sorted = Array.from(this.stats).sort((normA, normB) => {
        if (normA[0] === excluded) return 1;
        if (normB[0] === excluded) return -1;
        if (normA[1].needPerRunePerc < normB[1].needPerRunePerc) return 1;
        if (normA[1].needPerRunePerc > normB[1].needPerRunePerc) {
          return -1
        }
        return 0
      })
      this.statPriority.set(slot, new StatPriority(sorted[0][0], sorted[1][0], sorted[2][0], sorted[3][0], sorted[4][0], excluded))
    }

  }

  private countStatsForEvenSlots(preferred_slot: Map<Slot, Array<Stat>>, acceptable_slot: Map<Slot, Array<Stat>>) {
    this.statsCountForEvenSlots = new Map([
      [Slot.ONE, new Map()],
      [Slot.TWO, new Map()],
      [Slot.THREE, new Map()],
      [Slot.FOUR, new Map()],
      [Slot.FIVE, new Map()],
      [Slot.SIX, new Map()],
    ])
    const stats = [Stat["HP%"], Stat["Atk%"], Stat["Def%"], Stat.Spd, Stat["Res%"], Stat["Acc%"], Stat["CtR%"], Stat["CtD%"]]
    stats.forEach(stat => {
      this.statsCountForEvenSlots.get(Slot.ONE).set(stat, 0)
      this.statsCountForEvenSlots.get(Slot.TWO).set(stat,
        preferred_slot.get(Slot.TWO).filter(it => it === stat).length + acceptable_slot.get(Slot.TWO).filter(it => it === stat).length)
      this.statsCountForEvenSlots.get(Slot.THREE).set(stat, 0)
      this.statsCountForEvenSlots.get(Slot.FOUR).set(stat,
        preferred_slot.get(Slot.FOUR).filter(it => it === stat).length + acceptable_slot.get(Slot.FOUR).filter(it => it === stat).length)
      this.statsCountForEvenSlots.get(Slot.FIVE).set(stat, 0)
      this.statsCountForEvenSlots.get(Slot.SIX).set(stat,
        preferred_slot.get(Slot.SIX).filter(it => it === stat).length + acceptable_slot.get(Slot.SIX).filter(it => it === stat).length)
    })
  }

  private createValueOfPowerGemGrind() {
    allStats.forEach(stat => {
      this.powerGemGrindValues.set(stat, new ValueOfPowerGemGrind(stat))
    })
  }

  
}

function filterPowerGemGrindByStats(powerGemGrindValues: Map<Stat, ValueOfPowerGemGrind>, stats: Array<Stat>): [Stat, ValueOfPowerGemGrind] {
  return Array.from(powerGemGrindValues).filter(([key, value]) => !stats.includes(key)).sort((a, b) => {
    if (a[1].normalizedGemGrind < b[1].normalizedGemGrind) return 1
    if (a[1].normalizedGemGrind > b[1].normalizedGemGrind) return -1
    return 0
  })[0]
}

function containsStatInEvenSlots(preferred_slot: Map<Slot, Array<Stat>>, acceptable_slot: Map<Slot, Array<Stat>>, stat: Stat): boolean {
  return Array.from(preferred_slot).some(([key, value]) => value.some(pstat => pstat === stat)) || Array.from(acceptable_slot).some(([key, value]) => value.some(astat => astat === stat))
}

function normalizedValueOfSlot(normalize: PresetNormalization, slot: Slot): number {
  return normalize.normalize.get(slot)
}

export { Preset, filterPowerGemGrindByStats, containsStatInEvenSlots, normalizedValueOfSlot }