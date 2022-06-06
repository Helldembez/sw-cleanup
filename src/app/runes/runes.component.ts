import { Component, OnInit } from '@angular/core';
import { BuildType, Rune, RuneSet, Stat, Value } from '../home/models'
import { Action, Slot } from '../home/values';
import { ImporterService } from '../importer.service';

@Component({
  selector: 'app-runes',
  templateUrl: './runes.component.html',
  styleUrls: ['./runes.component.scss']
})
export class RunesComponent implements OnInit {
  private importService: ImporterService
  private runes: Array<Rune>

  public RuneSet = RuneSet
  public Stat = Stat
  public Slot = Slot
  public BuildType = BuildType
  public Action = Action
  public Value = Value

  constructor(service: ImporterService) {
    this.importService = service
  }

  ngAfterContentInit(): void {
    
      this.runes = this.importService.getRunes()
      console.log("aaa")
  }
  ngOnInit(): void {
  }



}
