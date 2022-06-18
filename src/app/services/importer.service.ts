import { Injectable } from '@angular/core';
import { RuneSet, Action, BuildType } from '../global/models';
import { Value } from '../presets/models/value';
import { Rune } from '../runes/models/rune';
import { RuneView } from '../runes/models/rune-view';
const fs = window.require('fs')


@Injectable({
  providedIn: 'root'
})
export class ImporterService {
  private mapping: Map<string, string>
  constructor() {
    this.mapping = this.fetchMapping()
  }

  import(fileLocation: String): number {
    let data = fs.readFileSync(fileLocation).toString()
    let profile = JSON.parse(data)

    let equipedRunes = profile.unit_list.flatMap(u => u.runes.map(r => new Rune(r, this.mapping.get(u.unit_master_id))))
    let runes = profile.runes.map((r: any) => new Rune(r, "Inventory"))
    window.localStorage.setItem("runes", JSON.stringify(runes.concat(equipedRunes)))
    return runes.length + equipedRunes.length
  }

  getRunes(): Array<RuneView> {
    let runes: Array<Rune> = new Array<Rune>()
    Object.assign(runes, JSON.parse(window.localStorage.getItem("runes"), (key, value) => this.deserialize(key, value)))
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
      rune.location = it.location
      return rune
    })
  }

  clear() {
    window.localStorage.removeItem("runes")
  }

  clean() {
    window.localStorage.clear()
  }

  private deserialize(key, value) {
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
  }

  private fetchMapping(): Map<string, string> {
    let data: any
    let mapping = new Map<string, string>()

    fetch('https://raw.githubusercontent.com/swarfarm/swarfarm/master/bestiary/fixtures/bestiary_data.json.zip')
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        data = myJson
        data.forEach((model) => {
          if (model.model === "bestiary.monster") {
            if (model.fields.name.length < 1) {
              console.log(model)
            }
            let name = model.fields.name //+ model.fields.awaken_level === 2 ? " (2A)" : ""
            if (model.fields.awaken_level === 2) {
              name = name + " (2A)"
            }
            if (model.fields.is_awakened === false) {
              name = (model.fields.element[0].toUpperCase() + model.fields.element.slice(1) + " " + name)
            }
            mapping.set(model.fields.com2us_id, name)
          }
        })
      });
    return mapping
  }
}

