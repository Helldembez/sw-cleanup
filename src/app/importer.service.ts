import { Injectable } from '@angular/core';
import { BuildType, Rune, RuneSet, Value } from './home/models'
import { Action } from './home/values';
import { RuneView } from './runes/runes.component';
const fs = window.require('fs')


@Injectable({
  providedIn: 'root'
})
export class ImporterService {
  constructor() { }

  import(fileLocation: String) : number {
    let data = fs.readFileSync(fileLocation).toString()
    let profile = JSON.parse(data)
    let runes = profile.runes.map((r: any) => new Rune(r)) 
    window.localStorage.setItem("runes", JSON.stringify(runes))
    return runes.length
  }

  getRunes(): Array<RuneView> {
    let runes: Array<Rune> = new Array<Rune>()
    Object.assign(runes, JSON.parse(window.localStorage.getItem("runes"), (key, value) => {
      switch (key) {
        case "value":
          if (!value.stat) {
            return value
          }
        case "sub1":
        case "sub2":
        case "sub3":
        case "sub4":
        case "prefix":
          return new Value(value.stat, value.value, value.reapp, value.grind)
        default: return value
      }
    }))
    return runes.map(it => {
      const rune = new RuneView
      rune.set = RuneSet[it.set]
      rune.slot = it.slot
      rune.level = it.level
      rune.mainstat = it.value.toString()
      rune.prefix = it.prefix.toString()
      rune.sub1 = it.sub1.toString()
      rune.sub2 = it.sub2.toString()
      rune.sub3 = it.sub3.toString()
      rune.sub4 = it.sub4.toString()
      rune.action = Action[it.action]
      rune.value = it.potValue
      rune.build = BuildType[it.build]
      rune.bestSub1 = it.bestPreset.sub1.toGemGrindString()
      rune.bestSub2 = it.bestPreset.sub2.toGemGrindString()
      rune.bestSub3 = it.bestPreset.sub3.toGemGrindString()
      rune.bestSub4 = it.bestPreset.sub4.toGemGrindString()
      rune.slotToGem = it.bestPreset.subSlotToGem
      return rune
    })
  }

  clear() {
    window.localStorage.removeItem("runes")
  }

  clean() {
    window.localStorage.clear()
  }
}
