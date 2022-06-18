import { getProperties } from "../../global/functions"
import { RuneSet, Slot, BuildType, Stat, Action } from "../../global/models"
import { getPresets } from "../../presets/models/default-presets"
import { PresetInstance } from "../../presets/models/preset-instance"
import { Value } from "../../presets/models/value"

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
  location: string

  constructor(rune: any, location: string) {
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
    this.location = location
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
    const bestPreset = Array.from(getPresets()).map(([type, preset]) => {
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

export { Rune }