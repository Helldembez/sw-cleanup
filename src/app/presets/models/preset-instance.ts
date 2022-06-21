import { ROUND, isFlatStat, flatStatToPercStat, getProperties } from "../../global/functions"
import { valuesForStat } from "../../global/mapping"
import { Stat, BuildType, Slot } from "../../global/models"
import { Rune } from "../../runes/models/rune"
import { containsStatInEvenSlots, filterPowerGemGrindByStats, normalizedValueOfSlot, Preset } from "./preset"
import { Value } from "./value"
import { ValueOfPowerGemGrind } from "./value-power-gem-grind"


class PresetInstance {
  private preset: Preset
  sub1: Value
  sub2: Value
  sub3: Value
  sub4: Value
  subSlotToGem: number
  private gemValue: number
  private grindValue: number
  private stat: Stat
  build: BuildType
  potential: number

  constructor(preset: Preset) {
    this.preset = preset
    this.build = preset.build
  }

  calculatePotentialValue(rune: Rune) {
    if (rune.slot % 2 === 0 && !containsStatInEvenSlots(this.preset.preferred_slot, this.preset.acceptable_slot, rune.value.stat)) {
      this.potential = 0
    } else {
      this.sub1 = this.calculatePotentialSubs(rune.sub1, 1, rune)
      this.sub2 = this.calculatePotentialSubs(rune.sub2, 2, rune)
      this.sub3 = this.calculatePotentialSubs(rune.sub3, 3, rune)
      this.sub4 = this.calculatePotentialSubs(rune.sub4, 4, rune)
      this.subSlotToGem = this.calculateStatToGem()
      this.stat = this.calculateStat(rune)
      this.gemValue = this.calculateGemValue(this.valueForNumber())
      this.grindValue = this.calculateGrindValue(this.valueForNumber())

      switch (this.subSlotToGem) {
        case 1: this.sub1 = new Value(this.stat, this.gemValue, true, this.grindValue); break;
        case 2: this.sub2 = new Value(this.stat, this.gemValue, true, this.grindValue); break;
        case 3: this.sub3 = new Value(this.stat, this.gemValue, true, this.grindValue); break;
        case 4: this.sub4 = new Value(this.stat, this.gemValue, true, this.grindValue); break;
      }


      let potential = (normalizedValueOfSlot(this.preset.normalize, rune.slot) + this.calculateValueForPrefix(rune) + this.calculatePotentialForSubs() + this.calculateGradeValue(rune))
      potential *= this.scalemainstatorsomeshit(rune)
      potential *= this.scaleToSet(rune)
      potential *= this.preset.normalize.multiplyFactor.get(rune.slot)
      this.potential = ROUND(potential, 2)
    }
  }

  private scalemainstatorsomeshit(rune: Rune): number {
    const val = this.preset.statsCountForEvenSlots.get(rune.slot).get(rune.value.stat)
    if (val > 0) {
      return val
    } else {
      return 1
    }
  }

  private scaleToSet(rune: Rune) {
    if (this.preset.preferred_set.includes(rune.set)) {
      return 1
    } else if (this.preset.acceptable_set.includes(rune.set)) {
      return 0.85
    } else {
      return 0.70
    }
  }

  private calculateGradeValue(rune: Rune): number {
    if (rune.grade < 6) {
      const stat = isFlatStat(rune.value.stat) ? flatStatToPercStat(rune.value.stat) : rune.value.stat
      const norm = this.preset.stats.get(stat).normalization
      return (6 - rune.grade) * rune.slot % 2 === 0 ? valuesForStat.get(stat)[1] * this.preset.stats.get(stat).normalization : (valuesForStat.get(stat)[1] * norm) * 100
    } else {
      return 0
    }
  }

  private potentialForValue(value: Value): number {
    if (isFlatStat(value.stat)) {
      const presetStat = this.preset.stats.get(flatStatToPercStat(value.stat))
      return (value.value + value.grind) * presetStat.normalization * 100 / presetStat.avgBase
    } else {
      return (value.value + value.grind) * this.preset.stats.get(value.stat).normalization
    }
  }

  private calculatePotentialForSubs() {
    const value = this.potentialForValue(new Value(this.stat, this.gemValue, true, this.grindValue))

    const potential =
      (this.subSlotToGem === 1 ? value : this.potentialForValue(this.sub1)) +
      (this.subSlotToGem === 2 ? value : this.potentialForValue(this.sub2)) +
      (this.subSlotToGem === 3 ? value : this.potentialForValue(this.sub3)) +
      (this.subSlotToGem === 4 ? value : this.potentialForValue(this.sub4))
    return potential
  }

  private calculateGrindValue(value: Value): number {
    if (this.stat === value.stat && this.gemValue === value.value && value.grind >= this.preset.powerGemGrindValues.get(this.stat).grind) {
      return value.grind
    } else {
      return this.preset.powerGemGrindValues.get(this.stat).grind
    }
  }

  // why would you got for 3rd best to save mana .Also stat cant be atk+/atk% when slot one so why is that the stat/gem in recommended??
  private calculateStat(rune: Rune): Stat {
    const value = this.valueForNumber()
    const parsedStat = isFlatStat(value.stat) ? flatStatToPercStat(value.stat) : value.stat
    const right = (value.value + value.grind) * (isFlatStat(value.stat) ? 100 * this.preset.stats.get(parsedStat).normalization / this.preset.stats.get(parsedStat).avgBase : this.preset.stats.get(parsedStat).normalization)

    const filtered = Array.from(filterPowerGemGrindByStats(this.preset.powerGemGrindValues, [ // TODO this shit doesnt work
      rune.value.stat,
      rune.prefix.isEmpty() ? Stat.EMPTY : rune.prefix.stat,
      value.stat,
      this.subSlotToGem !== 1 ? this.sub1.stat : Stat.EMPTY,
      this.subSlotToGem !== 2 ? this.sub2.stat : Stat.EMPTY,
      this.subSlotToGem !== 3 ? this.sub3.stat : Stat.EMPTY,
      this.subSlotToGem !== 4 ? this.sub4.stat : Stat.EMPTY,
      rune.slot == 1 ? Stat["Def%"] : Stat.EMPTY,
      rune.slot == 1 ? Stat["Def+"] : Stat.EMPTY,
      rune.slot == 3 ? Stat["Atk%"] : Stat.EMPTY,
      rune.slot == 3 ? Stat["Atk+"] : Stat.EMPTY]))

    if (
      (filtered[1] as ValueOfPowerGemGrind).normalizedGemGrind > right) {
      return (filtered[0] as Stat)
    } else {
      return value.stat
    }
  }

  private valueForNumber(): Value {
    switch (this.subSlotToGem) {
      case 1: return this.sub1
      case 2: return this.sub2
      case 3: return this.sub3
      case 4: return this.sub4
    }
  }

  private calculateGemValue(val: Value): number {
    if (this.stat === val.stat && (val.value + val.grind) > this.preset.powerGemGrindValues.get(this.stat).gemGrind) {
      return val.value
    } else {
      return this.preset.powerGemGrindValues.get(this.stat).gem
    }
  }

  private calculatePotentialSubs(value: Value, subSlot: number, rune: Rune): Value {
    const sub1Stat = value.stat !== Stat.EMPTY ? value.stat : this.statForSubSlot(subSlot, rune)
    var sub1Value: number;
    if (value.isEmpty()) {
      sub1Value = this.preset.powerGemGrindValues.get(sub1Stat).powerUp - Math.max(0, 6 - rune.grade)
    } else {
      sub1Value = value.value
      if (value.value + rune.inStatRollLeft > 0) {
        sub1Value += this.isStatHighestNorm(value.stat, rune) ? this.x1(value.stat, rune) : this.x2(value.stat, rune)
      } else {
        sub1Value += 0
      }
    }
    const sub1Grind = value.isEmpty() ? this.preset.powerGemGrindValues.get(sub1Stat).grind : value.grind >= this.preset.powerGemGrindValues.get(value.stat).grind ? value.grind : this.preset.powerGemGrindValues.get(sub1Stat).grind //sub1 or value.stat?

    return new Value(sub1Stat, sub1Value, value.reapp, sub1Grind)
  }

  private calculateValueForPrefix(rune: Rune): number {
    if (rune.prefix.isEmpty()) return 0
    if (isFlatStat(rune.prefix.stat)) {
      return rune.prefix.value * this.preset.stats.get(flatStatToPercStat(rune.prefix.stat)).normalization * 100 / this.preset.stats.get(flatStatToPercStat(rune.prefix.stat)).avgBase
    } else {
      return rune.prefix.value * this.preset.stats.get(rune.prefix.stat).normalization
    }
  }

  private statForSubSlot(subSlot: number, rune: Rune): Stat {
    const nThHighestValue = Math.ceil((getProperties().powerUp + 1) / 2)
    let allowList: Array<Stat> = [rune.value.stat, rune.prefix.stat, rune.sub1.stat, rune.sub2.stat, rune.sub3.stat, rune.sub4.stat] // cell AH?
    switch (subSlot) {
      case 2:
        allowList = allowList.concat([this.sub1.stat]);
        break;
      case 3:
        allowList = allowList.concat([this.sub1.stat, this.sub2.stat]);
        break;
      case 4:
        allowList = allowList.concat([this.sub1.stat, this.sub2.stat, this.sub3.stat]);
        break;
    }

    const atk = rune.slot === Slot.THREE ? [Stat["Atk%"], Stat["Atk+"]] : []
    const def = rune.slot === Slot.ONE ? [Stat["Def%"], Stat["Def+"]] : []
    allowList = allowList.concat(atk, def)
    const normalizedArray = Array.from(this.preset.powerGemGrindValues).filter(([key, value]) => !allowList.some(it => it === key)).sort(([key1, value1], [key2, value2]) => {
      if (value1.normalizedGemGrind < value2.normalizedGemGrind) return 1
      if (value1.normalizedGemGrind > value2.normalizedGemGrind) return -1
      return 0
    })
    return normalizedArray.at(nThHighestValue - 1)[0]
  }


  private x1(stat: Stat, rune: Rune) { // TODO: Give good name
    return rune.inStatRollLeft * (1 / rune.nrOfStats + (5 - getProperties().powerUp) * (1 - 1 / rune.nrOfStats) / 4) * this.preset.powerGemGrindValues.get(stat).powerUp * rune.grade / 6
  }

  private x2(stat: Stat, rune: Rune) { // TODO: Give good name
    return rune.inStatRollLeft * (1 / rune.nrOfStats - (5 - getProperties().powerUp) * (1 / rune.nrOfStats) / 4) * this.preset.powerGemGrindValues.get(stat).powerUp * rune.grade / 6
  }

  private isStatHighestNorm(stat: Stat, rune: Rune) {
    const norm1 = rune.sub1.isEmpty ? 0 : this.preset.powerGemGrindValues.get(rune.sub1.stat).normalizedPowerUp
    const norm2 = rune.sub2.isEmpty ? 0 : this.preset.powerGemGrindValues.get(rune.sub2.stat).normalizedPowerUp
    const norm3 = rune.sub3.isEmpty ? 0 : this.preset.powerGemGrindValues.get(rune.sub3.stat).normalizedPowerUp
    const norm4 = rune.sub4.isEmpty ? 0 : this.preset.powerGemGrindValues.get(rune.sub4.stat).normalizedPowerUp
    return this.preset.powerGemGrindValues.get(stat).normalizedPowerUp === Math.max(norm1, norm2, norm3, norm4)
  }

  private calculateStatToGem() {
    const reapp = [this.sub1, this.sub2, this.sub3, this.sub4].findIndex((it) => it.reapp)
    if (reapp > -1) { return reapp + 1 }

    const sub1ValueNormalized = this.subValueNormalized(this.sub1)
    const sub2ValueNormalized = this.subValueNormalized(this.sub2)
    const sub3ValueNormalized = this.subValueNormalized(this.sub3)
    const sub4ValueNormalized = this.subValueNormalized(this.sub4)
    const lowest = Math.min(sub1ValueNormalized, sub2ValueNormalized, sub3ValueNormalized, sub4ValueNormalized)

    switch (lowest) {
      case sub1ValueNormalized: return 1
      case sub2ValueNormalized: return 2
      case sub3ValueNormalized: return 3
      case sub4ValueNormalized: return 4
    }
  }

  private subValueNormalized(value: Value): number {
    const parsedStat: Stat = isFlatStat(value.stat) ? flatStatToPercStat(value.stat) : value.stat
    const presetStat = this.preset.stats.get(parsedStat)
    return (value.value + value.grind) * (isFlatStat(value.stat) ? 100 * presetStat.normalization / presetStat.avgBase : presetStat.normalization)
  }
}

export { PresetInstance }