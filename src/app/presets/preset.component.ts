import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { BuildType, Stat } from "../global/models";
import { getPresets } from "./models/default-presets";
import { Preset } from "./models/preset";

@Component({
  selector: 'app-preset',
  templateUrl: './preset.component.html',
})
export class PresetComponent implements OnChanges {
  @Input() preset!: string;
  presets: Map<BuildType, Preset>;
  private presetInstance: Preset
  presetForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.presets = getPresets()
  }
  ngOnChanges(changes: SimpleChanges): void {

    if (this.preset) {

      this.presetInstance = this.presets.get(BuildType[this.preset])
      this.presetForm = this.fb.group({
        hp: this.presetInstance.stats.get(Stat["HP%"]).desiredValue,
      spd: this.presetInstance.stats.get(Stat.Spd).desiredValue,
        atk: this.presetInstance.stats.get(Stat["Atk%"]).desiredValue,
        def: this.presetInstance.stats.get(Stat["Def%"]).desiredValue,
        ctr: this.presetInstance.stats.get(Stat["CtR%"]).desiredValue,
        ctd: this.presetInstance.stats.get(Stat["CtD%"]).desiredValue,
        acc: this.presetInstance.stats.get(Stat["Acc%"]).desiredValue,
        res: this.presetInstance.stats.get(Stat["Res%"]).desiredValue,
      });
    } else {
      this.presetForm = this.fb.group({});
    }
  }

  submit() {
    this.presetInstance.stats.get(Stat["HP%"]).desiredValue = this.presetForm.value["hp"]
    this.presetInstance.stats.get(Stat.Spd).desiredValue = this.presetForm.value["spd"]
    this.presetInstance.stats.get(Stat["Atk%"]).desiredValue = this.presetForm.value["atk"]
    this.presetInstance.stats.get(Stat["Def%"]).desiredValue = this.presetForm.value["def"]
    this.presetInstance.stats.get(Stat["CtR%"]).desiredValue = this.presetForm.value["ctr"]
    this.presetInstance.stats.get(Stat["CtD%"]).desiredValue = this.presetForm.value["ctd"]
    this.presetInstance.stats.get(Stat["Acc%"]).desiredValue = this.presetForm.value["acc"]
    this.presetInstance.stats.get(Stat["Res%"]).desiredValue = this.presetForm.value["res"]
    this.presets.set(BuildType[this.preset], this.presetInstance)
    window.localStorage.setItem("presets", JSON.stringify(this.presets, (key, value) => {
      if (value instanceof Map) {
        return {
          dataType: 'Map',
          value: Array.from(value.entries()),
        };
      } else {
        return value;
      }
    }))
  }
}