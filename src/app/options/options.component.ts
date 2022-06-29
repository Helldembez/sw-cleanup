import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { getProperties } from '../global/functions';
import { Properties, BuildType } from '../global/models';
import { Rune } from '../runes/models/rune';
import { ImporterService } from '../services/importer.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  optionsForm: FormGroup;
  levels = [
    { id: 2, name: "Beginner" },
    { id: 3, name: "Beginner+" },
    { id: 4, name: "Fighter" },
    { id: 5, name: "Conquer" },
    { id: 6, name: "Guardian" },
    { id: 7, name: "Guardian2" },
    { id: 8, name: "Legend" }
  ];
  brokenRunes = [
    { id: 1, name: "No different" },
    { id: 2, name: "All the time" },
    { id: 3, name: "Keep good ones" },
    { id: 4, name: "Only the best" },
    { id: 5, name: "No broken" },
  ]
  powerUp = [
    { id: 1, name: "Roll any hint of potential" },
    { id: 2, name: "Got mana to spend" },
    { id: 3, name: "Ambitious" },
    { id: 4, name: "Mana saving" },
    { id: 5, name: "Only roll guaranteed runes" },
  ]
  gemGrind = [
    { id: 1, name: "Max values (purple/hero)" },
    { id: 2, name: "Approx. 3/4 of max" },
    { id: 3, name: "Average values" },
    { id: 4, name: "No gem/grinds" },
  ]

  constructor(private fb: FormBuilder, private service: ImporterService) { }

  ngOnInit(): void {
    const properties: Properties = getProperties()
    this.optionsForm = this.fb.group({
      level: properties.level,
      brokenRunes: properties.brokenRunes,
      powerUp: properties.powerUp,
      gemGrind: properties.gemGrind,
      FastDD: properties.Focus.get(BuildType['Fast DD']),
      SlowDD: properties.Focus.get(BuildType['Slow DD']),
      DefDD: properties.Focus.get(BuildType['Def DD']),
      Bomber: properties.Focus.get(BuildType.Bomber),
      Support: properties.Focus.get(BuildType.Support),
      PvPDef: properties.Focus.get(BuildType['PvP Def']),
      Bruiser: properties.Focus.get(BuildType.Bruiser),
    });
  }

  submit() {
    const properties = new Properties()
    properties.level = this.optionsForm.value["level"]
    properties.brokenRunes = this.optionsForm.value["brokenRunes"]
    properties.powerUp = this.optionsForm.value["powerUp"]
    properties.gemGrind = this.optionsForm.value["gemGrind"]
    properties.Focus.set(BuildType['Fast DD'], this.optionsForm.value["FastDD"])
    properties.Focus.set(BuildType['Slow DD'], this.optionsForm.value["SlowDD"])
    properties.Focus.set(BuildType['Def DD'], this.optionsForm.value["DefDD"])
    properties.Focus.set(BuildType.Bomber, this.optionsForm.value["Bomber"])
    properties.Focus.set(BuildType.Support, this.optionsForm.value["Support"])
    properties.Focus.set(BuildType['PvP Def'], this.optionsForm.value["PvPDef"])
    properties.Focus.set(BuildType.Bruiser, this.optionsForm.value["Bruiser"])
    window.localStorage.setItem("properties", JSON.stringify(properties, (key, value) => {
      if (value instanceof Map) {
        return {
          dataType: 'Map',
          value: Array.from(value.entries()),
        };
      } else {
        return value;
      }
    }))

    const runes = this.service.getRunes().map(it=> new Rune(it))
    this.service.storeRunes(runes)
  }
}