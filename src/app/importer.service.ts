import { Injectable } from '@angular/core';
import { Rune, Value } from './home/models'
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

  getRunes(): Array<Rune> {
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
    return runes
  }

  clear() {
    window.localStorage.removeItem("runes")
  }

  clean() {
    window.localStorage.clear()
  }
}
