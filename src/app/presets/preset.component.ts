import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { asStringList, BuildType, PrimaryStat, RuneSet, Slot, Stat } from "../global/models";
import { Rune } from "../runes/models/rune";
import { ImporterService } from "../services/importer.service";
import { getPresets } from "./models/default-presets";
import { Preset } from "./models/preset";
import { PresetInstance } from "./models/preset-instance";

@Component({
  selector: 'app-preset',
  templateUrl: './preset.component.html',
})
export class PresetComponent implements OnChanges {
  @Input() preset!: string;
  presets: Map<BuildType, Preset>;
  private presetInstance: Preset
  presetForm: FormGroup;
  stats2: Array<string>
  stats4: Array<string>
  stats6: Array<string>
  RuneSet(): Array<string> {
    var keys = Object.keys(RuneSet);
    return keys.slice(keys.length / 2).filter(it => it !== RuneSet[RuneSet.Immemoral]);
  }

  constructor(private fb: FormBuilder, private service: ImporterService) {
    var keys = Object.keys(Stat);
    let stats = keys.slice(keys.length / 2).filter(it => it !== Stat[Stat.EMPTY]);
    this.stats2 = stats.filter(it => !["CtR%", "CtD%", "Acc%", "Res%"].includes(it))
    this.stats4 = stats.filter(it => !["Spd", "Acc%", "Res%"].includes(it))
    this.stats6 = stats.filter(it => !["CtR%", "CtD%", "Spd"].includes(it))
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.preset) {
      this.presets = getPresets()
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
        preferred_set: [this.presetInstance.preferred_set.map(it => RuneSet[it])],
        acceptable_set: [this.presetInstance.acceptable_set.map(it => RuneSet[it])],
        preferredSlot2_1: Stat[this.presetInstance.preferred_slot.get(Slot.TWO).at(0)],
        preferredSlot4_1: Stat[this.presetInstance.preferred_slot.get(Slot.FOUR).at(0)],
        preferredSlot6_1: Stat[this.presetInstance.preferred_slot.get(Slot.SIX).at(0)],
        preferredSlot2_2: Stat[this.presetInstance.preferred_slot.get(Slot.TWO).at(1)],
        preferredSlot4_2: Stat[this.presetInstance.preferred_slot.get(Slot.FOUR).at(1)],
        preferredSlot6_2: Stat[this.presetInstance.preferred_slot.get(Slot.SIX).at(1)],
        preferredSlot2_3: Stat[this.presetInstance.preferred_slot.get(Slot.TWO).at(2)],
        preferredSlot4_3: Stat[this.presetInstance.preferred_slot.get(Slot.FOUR).at(2)],
        preferredSlot6_3: Stat[this.presetInstance.preferred_slot.get(Slot.SIX).at(2)],
        acceptableSlot2_1: Stat[this.presetInstance.acceptable_slot.get(Slot.TWO).at(0)],
        acceptableSlot4_1: Stat[this.presetInstance.acceptable_slot.get(Slot.FOUR).at(0)],
        acceptableSlot6_1: Stat[this.presetInstance.acceptable_slot.get(Slot.SIX).at(0)],
        acceptableSlot2_2: Stat[this.presetInstance.acceptable_slot.get(Slot.TWO).at(1)],
        acceptableSlot4_2: Stat[this.presetInstance.acceptable_slot.get(Slot.FOUR).at(1)],
        acceptableSlot6_2: Stat[this.presetInstance.acceptable_slot.get(Slot.SIX).at(1)],
        acceptableSlot2_3: Stat[this.presetInstance.acceptable_slot.get(Slot.TWO).at(2)],
        acceptableSlot4_3: Stat[this.presetInstance.acceptable_slot.get(Slot.FOUR).at(2)],
        acceptableSlot6_3: Stat[this.presetInstance.acceptable_slot.get(Slot.SIX).at(2)],
        primary_stats: [asStringList(this.presetInstance.primary_stat)]
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
    this.presetInstance.preferred_set = this.presetForm.value["preferred_set"].map(it => RuneSet[it])
    this.presetInstance.acceptable_set = this.presetForm.value["acceptable_set"].map(it => RuneSet[it])
    this.presetInstance.preferred_slot.set(Slot.TWO, [
      this.presetForm.value["preferredSlot2_1"],
      this.presetForm.value["preferredSlot2_2"],
      this.presetForm.value["preferredSlot2_3"]
    ].map((it: string) => Stat[it]))
    this.presetInstance.preferred_slot.set(Slot.FOUR, [
      this.presetForm.value["preferredSlot4_1"],
      this.presetForm.value["preferredSlot4_2"],
      this.presetForm.value["preferredSlot4_3"]
    ].map((it: string) => Stat[it]))
    this.presetInstance.preferred_slot.set(Slot.SIX, [
      this.presetForm.value["preferredSlot6_1"],
      this.presetForm.value["preferredSlot6_2"],
      this.presetForm.value["preferredSlot6_3"]
    ].map((it: string) => Stat[it]))
    this.presetInstance.acceptable_slot.set(Slot.TWO, [
      this.presetForm.value["acceptableSlot2_1"],
      this.presetForm.value["acceptableSlot2_2"],
      this.presetForm.value["acceptableSlot2_3"]
    ].map((it: string) => Stat[it]))
    this.presetInstance.acceptable_slot.set(Slot.FOUR, [
      this.presetForm.value["acceptableSlot4_1"],
      this.presetForm.value["acceptableSlot4_2"],
      this.presetForm.value["acceptableSlot4_3"]
    ].map((it: string) => Stat[it]))
    this.presetInstance.acceptable_slot.set(Slot.SIX, [
      this.presetForm.value["acceptableSlot6_1"],
      this.presetForm.value["acceptableSlot6_2"],
      this.presetForm.value["acceptableSlot6_3"]
    ].map((it: string) => Stat[it]))
    const prim: Array<string> = this.presetForm.value["primary_stats"]
    this.presetInstance.primary_stat = new PrimaryStat(prim.includes("Atk"), prim.includes("Def"), prim.includes("Hp"))
    const newPreset = new Preset(
      this.presetInstance.build,
      this.presetInstance.type,
      this.presetInstance.primary_stat,
      this.presetInstance.preferred_set,
      this.presetInstance.acceptable_set,
      this.presetInstance.preferred_slot,
      this.presetInstance.acceptable_slot,
      new Map(Array.from(this.presetInstance.stats).map(([key, value]) => [key, value.desiredValue])))
    this.presets.set(BuildType[this.preset], newPreset)
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

    const runes = this.service.getRunes().map(it=> new Rune(it))
    this.service.storeRunes(runes)
  }
}