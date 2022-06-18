import { ROUND, getProperties } from "../../global/functions"
import { maxRollsForStat, minMaxForStat, statsInSlot } from "../../global/mapping"
import { Slot, BuildType, Stat } from "../../global/models"
import { Preset } from "./preset"
import { PresetStat } from "./preset-stat"

class PresetNormalization {
  normalize: Map<Slot, number> = new Map()
  bestStatMax: Map<Slot, number> = new Map()
  secStatMax: Map<Slot, number> = new Map()
  tetStatMax: Map<Slot, number> = new Map()
  quadStatMax: Map<Slot, number> = new Map()
  innateMax: Map<Slot, number> = new Map()
  sum: Map<Slot, number> = new Map()
  maxScore: Map<Slot, number> = new Map()
  multiplyFactor: Map<Slot, number> = new Map()

  constructor(preset: Preset, buildType: BuildType) {
    for (let i = 1; i <= 6; i++) {
      const slot = i as Slot
      this.calculateNormalize(slot, preset.stats, preset.preferred_slot, buildType)
      this.calculateStatMax(slot, preset)
      this.calculateSum(slot)
      this.calculateMaxScore(slot, preset.statsCountForEvenSlots)
      this.multiplyFactor.set(slot, ROUND(10 / this.maxScore.get(slot), 4))
    }
  }

  private calculateStatMax(slot: Slot, preset: Preset) {
    var stat = preset.statPriority.get(slot).bestStat
    this.bestStatMax.set(slot, ROUND(maxRollsForStat.get(stat)[1] * preset.stats.get(stat).normalization, 2))
    stat = preset.statPriority.get(slot).secondary
    this.secStatMax.set(slot, ROUND(maxRollsForStat.get(stat)[0] * preset.stats.get(stat).normalization, 2))
    stat = preset.statPriority.get(slot).tetriary
    this.tetStatMax.set(slot, ROUND(maxRollsForStat.get(stat)[0] * preset.stats.get(stat).normalization, 2))
    stat = preset.statPriority.get(slot).quaternary
    this.quadStatMax.set(slot, ROUND(maxRollsForStat.get(stat)[0] * preset.stats.get(stat).normalization, 2))
    stat = preset.statPriority.get(slot).innate
    this.innateMax.set(slot, ROUND(minMaxForStat.get(stat)[1] * preset.stats.get(stat).normalization, 2))
  }

  private calculateSum(slot: Slot) {
    this.sum.set(slot, ROUND(
      this.normalize.get(slot) +
      this.bestStatMax.get(slot) +
      this.secStatMax.get(slot) +
      this.tetStatMax.get(slot) +
      this.quadStatMax.get(slot) +
      this.innateMax.get(slot), 2)
    )
  }

  private calculateMaxScore(slot: Slot, statCountForEvenSlot: Map<Slot, Map<Stat, number>>) {
    const maxSlot = Math.max(...Array.from(statCountForEvenSlot.get(slot).values()))
    this.maxScore.set(slot, ROUND(this.sum.get(slot) * (maxSlot == 0 ? 1 : maxSlot), 2))
  }

  private calculateNormalize(slot: Slot, stats: Map<Stat, PresetStat>, preferred_slot: Map<Slot, Array<Stat>>, buildType: BuildType) {
    const filter3 = Array.from(stats).filter(([key, value]) => value.avgRollsPerRune >= 3).length
    const filter35 = Array.from(stats).filter(([key, value]) => value.avgRollsPerRune >= 3.5).length
    const prevalue = 10 * (-1 + filter3 + filter35 + getProperties().Focus.get(buildType))
    if (slot.valueOf() % 2 === 0) {
      this.normalize.set(slot, prevalue + 10 * statsInSlot.get(slot) / preferred_slot.get(slot).length)
    } else {
      this.normalize.set(slot, Math.round(prevalue + -100 * (this.avgStatsPreGrind(slot, stats) / statsInSlot.get(slot) - (1 / 3))))
    }
  }

  private avgStatsPreGrind(slot: Slot, stats: Map<Stat, PresetStat>) {
    return Array.from(stats).filter(([key, value]) => {
      if (slot == Slot.ONE && key == Stat["Def%"] || slot == Slot.THREE && key == Stat["Atk%"]) {
        return false;
      } else {
        return slot === Slot.FIVE ? value.needPerRunePerc >= 0.10 : value.needPerRunePerc >= 0.05;
      }
    }).length
  }

}

export { PresetNormalization }