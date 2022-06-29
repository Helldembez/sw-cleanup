import { getProperties, ROUND } from "../../global/functions"
import { minMaxForStat, grindGemTable, minMaxForGrind, minMaxForGem } from "../../global/mapping"
import { Stat } from "../../global/models"

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

export { ValueOfPowerGemGrind }