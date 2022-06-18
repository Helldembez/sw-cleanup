import { Stat } from "../../global/models"

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

export { Value }