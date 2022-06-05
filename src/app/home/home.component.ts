import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Rune, RuneSet, Stat, presets, Preset, BuildType } from "./models"
import { Slot } from "./values"

const fs = window.require('fs')

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public RuneSet = RuneSet
  public Stat = Stat
  public Slot = Slot
  public BuildType = BuildType
  fileLocation = ""
  file: File
  runes: Array<Rune>
  presets: Preset

  constructor(private router: Router) {

  }

  ngOnInit(): void {
    this.presets = presets.get(BuildType['Fast DD'])
    console.log('HomeComponent INIT');
    // TODO init 2nd part of presets
  }

  onFileSelected(event) {
    this.file = event.target.files[0];

    if (this.file) {
      this.fileLocation = this.file.path;
    }
  }

  loadFile() {
    //if (this.file) {
      console.log("parsing")
      this.fileLocation = "C:\\Users\\Coen\\Desktop\\Summoners War Exporter Files\\Helldembez-9776772.json"
      var data = fs.readFileSync(this.fileLocation).toString()
      var profile = JSON.parse(data)
      var count = 0
      this.runes = profile.runes.map((r: any) => {
        if (count < 10) {
          count++
          return new Rune(r)
        } else {
          return undefined
        }
      }).filter(it => it != undefined)
    //}
  }

  clear() {
    delete this.runes
  }
}