import { ROUND, MROUND } from "../../global/functions"
import { avgBaseForStatPerType, flatStatsForStat, valuesForStat } from "../../global/mapping"
import { Stat, MonsterType, PrimaryStat } from "../../global/models"
import { ValueOfPowerGemGrind } from "./value-power-gem-grind"

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

export { PresetStat }