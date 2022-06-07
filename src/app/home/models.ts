import { Stat, Slot, RuneSet, MonsterType, avgBaseForStatPerType, flatStatsForStat, valuesForStat, minMaxForGrind, minMaxForStat, grindGemTable, statsInSlot, minMaxForGem, maxRollsForStat, allStats, Action, Properties, getProperties } from "./values"

enum BuildType {
  "Fast DD",
  "Slow DD",
  "Def DD",
  "Bomber",
  "Support",
  "PvP Def",
  "Bruiser"
}


class Rune {
  id: number
  set: RuneSet
  slot: Slot
  rank: number
  grade: number
  ancient: Boolean
  level: number
  inStatRollLeft: number
  nrOfStats: number
  value: Value
  prefix: Value
  sub1: Value
  sub2: Value
  sub3: Value
  sub4: Value
  build: BuildType
  potValue: number
  action: Action
  bestPreset: PresetInstance

  constructor(rune: any) {
    console.log(getProperties().level)
    this.id = rune.rune_id
    this.set = rune.set_id as RuneSet
    this.slot = rune.slot_no
    this.ancient = rune.rank >= 10
    this.rank = rune.rank - (this.ancient ? 10 : 0)
    this.grade = rune.class - (this.ancient ? 10 : 0)
    this.level = rune.upgrade_curr
    this.inStatRollLeft = this.level >= 12 ? 0 : this.rank - 1 - Math.floor(this.level / 3)
    this.nrOfStats = this.rank - 1
    this.value = this.toValue(rune.pri_eff)
    this.prefix = this.toValue(rune.prefix_eff)
    this.sub1 = this.toValue(rune.sec_eff[0])
    this.sub2 = this.toValue(rune.sec_eff[1])
    this.sub3 = this.toValue(rune.sec_eff[2])
    this.sub4 = this.toValue(rune.sec_eff[3])
    this.calculateBestPreset()
    this.action = this.calculateAction()
  }

  private calculateAction() {
    if (this.potValue < getProperties().level) return Action.SELL
    if (this.level >= 12) return Action.KEEP
    return Action.POWERUP
  }

  private toValue(eff: any): Value {
    if (eff && eff[1] != 0) {
      const reapp = eff[2] ? Boolean(eff[2]) : false
      const grind = eff[3] ? eff[3] : 0
      return new Value(eff[0] as Stat, eff[1], reapp, grind)
    } else {
      return new Value(Stat.EMPTY, 0, false, 0)
    }
  }

  calculateBestPreset() {
    const bestPreset = Array.from(presets).map(([type, preset]) => {
      const instance = new PresetInstance(preset)
      instance.calculatePotentialValue(this)
      return instance
    }).sort((a, b) => {
      if (a.potential < b.potential) return 1
      if (a.potential > b.potential) return -1
      return 0
    })

    this.build = bestPreset[0].build
    this.potValue = bestPreset[0].potential
    this.bestPreset = bestPreset[0]
  }
}

class Value {
  value: number
  stat: Stat
  reapp: Boolean
  grind: number

  constructor(stat: Stat, value: number, reapp: Boolean, grind: number) {
    this.stat = stat
    this.value = value
    this.reapp = reapp
    this.grind = grind
  }

  toString() {
    return this.value > 0 ? "" + this.value + " " + Stat[this.stat] : ""
  }

  toGemGrindString() {
    if (this.isEmpty()) {
      return ""
    } else {
      const grind = this.grind > 0 ? "[" + this.grind + "]" : ""
      const reapp = this.reapp ? "🗘" : ""
      return (this.value + this.grind) + " " + grind + " " + reapp + " " + Stat[this.stat]
    }
  }

  isEmpty() {
    return this.value === 0
  }
}

class PresetInstance { // fields that are used in private functions as private field instead of param?
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
    if (rune.slot % 2 === 0 && !this.preset.containsStatInEvenSlots(rune.value.stat)) {
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
      

      let potential = (this.preset.normalizedValueOfSlot(rune.slot) + this.calculateValueForPrefix(rune) + this.calculatePotentialForSubs() + this.calculateGradeValue(rune))
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
    //const right = (value.value + value.grind) * (isFlatStat(value.stat) ? 100 * this.preset.stats.get(parsedStat).normalization / this.preset.stats.get(parsedStat).avgBase : this.preset.stats.get(parsedStat).normalization)
    const right = (value.value + value.grind) * (isFlatStat(value.stat) ? 100 * this.preset.stats.get(parsedStat).normalization / this.preset.stats.get(parsedStat).avgBase : this.preset.stats.get(parsedStat).normalization)

    const filtered = Array.from(this.preset.filterPowerGemGrindByStats([ // TODO this shit doesnt work
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

  containsStatInEvenSlots(stat: Stat): boolean {
    return Array.from(this.preferred_slot).some(([key, value]) => value.some(pstat => pstat === stat)) || Array.from(this.acceptable_slot).some(([key, value]) => value.some(astat => astat === stat))
  }

  normalizedValueOfSlot(slot: Slot): number {
    return this.normalize.normalize.get(slot)
  }

  filterPowerGemGrindByStats(stats: Array<Stat>): [Stat, ValueOfPowerGemGrind] {
    return Array.from(this.powerGemGrindValues).filter(([key, value]) => !stats.includes(key)).sort((a, b) => {
      if (a[1].normalizedGemGrind < b[1].normalizedGemGrind) return 1
      if (a[1].normalizedGemGrind > b[1].normalizedGemGrind) return -1
      return 0
    })[0]
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

class PresetStat {
  stat: Stat
  desiredValue: number
  avgBase: number
  fromFlatStats: number
  fromArtifacts: number
  fromEvenSlots: number

  needFromSubs: number
  needFromSubsPerc: number
  needFromSubsAvgRolls: number

  availableOnSubs: number
  assumedGrinds: number

  fromGrindsPerc: number

  needFromRollsPerc: number
  needPerRunePerc: number
  avgRollsPerRune: number

  normalization: number

  constructor(stat: Stat, desiredValue: number, type: MonsterType, primaryStat: PrimaryStat, preferredSlots: Map<number, Array<Stat>>, powerGemGrindValues: Map<Stat, ValueOfPowerGemGrind>) {
    // check rounding for values
    this.stat = stat
    this.desiredValue = desiredValue
    this.avgBase = avgBaseForStatPerType.get(type).get(this.stat)
    this.fromFlatStats = flatStatsForStat.get(this.stat)
    this.fromArtifacts = this.calculateArtifactsValue(primaryStat)
    this.fromEvenSlots = Math.round(this.calculateEvenSlotsValue(preferredSlots))
    const needFromSubs = this.desiredValue - (this.avgBase + this.fromFlatStats + this.fromArtifacts + this.fromEvenSlots)
    this.needFromSubs = needFromSubs > 0 ? needFromSubs : 0
    this.needFromSubsPerc = this.needFromSubs > 0 ? this.statInAtkDefHp() ? ROUND(this.needFromSubs / this.avgBase, 2) : this.needFromSubs / 100 : 0
    this.needFromSubsAvgRolls = ROUND(100 * this.needFromSubsPerc / powerGemGrindValues.get(this.stat).avgPowerUp, 2)
    this.availableOnSubs = (this.statInAtkDef() ? 5 : 6) - (this.slotsAreNotEmpty(preferredSlots) ? this.statInPreferredStatsRatio(preferredSlots) : 0)
  }

  constructPart2(allAvgRollsFromSub: number, powerGemGrindValue: ValueOfPowerGemGrind) {
    this.calculateAssumedGrind(allAvgRollsFromSub)
    this.fromGrindsPerc = this.assumedGrinds * powerGemGrindValue.grind / 100
    this.needFromRollsPerc = this.needFromSubsPerc - this.fromGrindsPerc
    this.needPerRunePerc = ROUND(this.needFromRollsPerc / this.availableOnSubs, 4)
    this.avgRollsPerRune = ROUND(this.needPerRunePerc / powerGemGrindValue.avgPowerUp * 100, 2)
  }

  calculateNormalization(allAvgRolesPerRune: number) {
    this.normalization = ROUND((this.avgRollsPerRune / allAvgRolesPerRune) * 8, 2)
  }

  private calculateAssumedGrind(allAvgRoles: number) {
    if (this.statInAtkDefHpSpd()) {
      const x = (this.needFromSubsAvgRolls / allAvgRoles) * 25
      this.assumedGrinds = MROUND(x > this.availableOnSubs ? this.availableOnSubs : x, 0.5)
    } else {
      this.assumedGrinds = 0
    }
  }

  private calculateArtifactsValue(primaryStat: PrimaryStat): number {
    if (primaryStat.valueForStat(this.stat)) {
      switch (this.stat) {
        case Stat["HP%"]: return 3000 / primaryStat.amountOfTrue()
        case Stat["Atk%"]: return 200 / primaryStat.amountOfTrue()
        case Stat["Def%"]: return 200 / primaryStat.amountOfTrue()
      }
    } else {
      return 0
    }
  }

  private statInPreferredStatsRatio(preferredSlots: Map<number, Array<Stat>>): number {
    const slot2 = preferredSlots.get(2).filter(it => it === this.stat).length / preferredSlots.get(2).length
    const slot4 = preferredSlots.get(4).filter(it => it === this.stat).length / preferredSlots.get(4).length
    const slot6 = preferredSlots.get(6).filter(it => it === this.stat).length / preferredSlots.get(6).length
    return slot2 + slot4 + slot6
  }

  private slotsAreNotEmpty(slots: Map<number, Array<Stat>>): Boolean {
    return Array.from(slots).some(([key, value]) => value.length > 0)
  }

  private statInAtkDefHpSpd(): Boolean {
    return [Stat["HP%"], Stat["Def%"], Stat["Atk%"], Stat.Spd].some(it => this.stat === it)
  }

  private statInAtkDefHp(): Boolean {
    return [Stat["HP%"], Stat["Def%"], Stat["Atk%"]].some(it => this.stat === it)
  }

  private statInAtkDef(): Boolean {
    return [Stat["Def%"], Stat["Atk%"]].some(it => this.stat === it)
  }

  private calculateEvenSlotsValue(preferredSlots: Map<number, Array<Stat>>): number {
    // TODO slots cannot be empty
    return this.slotsAreNotEmpty(preferredSlots) ? this.statInPreferredStatsRatio(preferredSlots) * valuesForStat.get(this.stat)[0] * (Number(this.statInAtkDefHp()) ? this.avgBase : 1) : 0
  }
}

class ValueOfPowerGemGrind {
  stat: Stat
  avgPowerUp: number
  powerUp: number
  normalizedPowerUp: number
  gem: number
  normalizedGem: number
  grind: number
  normalizedGrind: number
  gemGrind: number
  normalizedGemGrind: number

  constructor(stat: Stat) {
    this.stat = stat
    if (stat === Stat.EMPTY) {
      this.avgPowerUp = this.powerUp = this.gem = this.grind = this.gemGrind = this.normalizedPowerUp = this.normalizedGem = this.normalizedGem = this.normalizedGrind = this.normalizedGemGrind = 0
      return
    }
    this.avgPowerUp = (minMaxForStat.get(stat)[0] + minMaxForStat.get(stat)[1]) / 2
    this.powerUp = minMaxForStat.get(stat)[0] + (5 - getProperties().powerUp) / 4 * (minMaxForStat.get(stat)[1] - minMaxForStat.get(stat)[0])
    this.gem = this.calculateGem(stat, grindGemTable.get(getProperties().gemGrind))
    this.grind = this.calculateGrind(stat, grindGemTable.get(getProperties().gemGrind))
    this.gemGrind = this.gem + this.grind
  }

  calculateNormalizationStats(normalizedStat: number) {
    this.normalizedPowerUp = ROUND(normalizedStat * this.powerUp, 2)
    this.normalizedGem = ROUND(normalizedStat * this.gem, 2)
    this.normalizedGrind = ROUND(normalizedStat * this.grind, 2)
    this.normalizedGemGrind = ROUND(normalizedStat * this.gemGrind, 2)
  }

  private calculateGrind(stat: Stat, value: number) {
    return value != 4 ? Math.round(minMaxForGrind.get(stat)[0] + value * (minMaxForGrind.get(stat)[1] - minMaxForGrind.get(stat)[0])) : 0;
  }

  private calculateGem(stat: Stat, value: number) {
    return value != 4 ? Math.round(minMaxForGem.get(stat)[0] + value * (minMaxForGem.get(stat)[1] - minMaxForGem.get(stat)[0])) : 0
  }
}

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

const presets = new Map([
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

function MROUND(number, roundto) {
  return roundto * Math.round(number / roundto);
}

function ROUND(num: number, places: number) {
  const factor = 10 ** places;
  return Math.round(num * factor) / factor;
};

export { Preset, Stat, Rune, RuneSet, Value, BuildType, presets }