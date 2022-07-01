import { Component, OnInit } from '@angular/core';
import { BuildType } from '../global/models';
import { getPresets } from './models/default-presets';
import { Preset } from './models/preset';

@Component({
  selector: 'app-presets',
  templateUrl: './presets.component.html',
  styleUrls: ['./presets.component.scss']
})
export class PresetsComponent implements OnInit {
  presets: Map<BuildType, Preset>
  BuildType(): Array<string> {
    var keys = Object.keys(BuildType);
    return keys.slice(keys.length / 2);
  }

  buildType

  constructor() {
    this.presets = getPresets() 
  }

  ngOnInit(): void {
  }

}