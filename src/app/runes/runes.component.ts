import { DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { BuildType } from '../home/models';
import { RuneSet, Stat } from '../home/values';
import { RuneService } from './rune.service';
import { NgbdSortableHeader, SortEvent } from './sortable.directive';

@Component({
  selector: 'app-runes',
  templateUrl: './runes.component.html',
  styleUrls: ['./runes.component.scss'],
  providers: [RuneService, DecimalPipe]
})
export class RunesComponent {
  runes$: Observable<RuneView[]>;
  total$: Observable<number>;
  RuneSet(): Array<string> {
    var keys = Object.keys(RuneSet);
    return keys.slice(keys.length / 2).filter(it => it !== RuneSet[RuneSet.Immemoral]);
  }
  Stat(): Array<string> {
    var keys = Object.keys(Stat);
    return keys.slice(keys.length / 2).filter(it => it !== Stat[Stat.EMPTY]);
  }
  BuildType(): Array<string> {
    var keys = Object.keys(BuildType);
    return keys.slice(keys.length / 2);
  }

  @ViewChildren(NgbdSortableHeader) headers:
    QueryList<NgbdSortableHeader>;

  constructor(public service: RuneService) {
    this.runes$ = service.runes$;
    this.total$ = service.total$;
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  clear() {
    this.service.clear()
  }



}

export class RuneView {
  set: string
  slot: number
  level: number
  mainstat: string
  prefix: string
  sub1: string
  sub2: string
  sub3: string
  sub4: string
  action: string
  value: number
  build: string
  bestSub1: string
  bestSub2: string
  bestSub3: string
  bestSub4: string
  slotToGem: number
}