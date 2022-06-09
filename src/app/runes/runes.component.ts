import { Component, Directive, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { BuildType, Rune, RuneSet, Stat, Value } from '../home/models'
import { Action, Slot } from '../home/values';
import { ImporterService } from '../importer.service';

export type SortColumn = keyof RuneView | '';
export type SortDirection = 'asc' | 'desc' | '';
export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

const rotate: { [key: string]: SortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {

  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}

@Component({
  selector: 'app-runes',
  templateUrl: './runes.component.html',
  styleUrls: ['./runes.component.scss']
})
export class RunesComponent implements OnInit {
  private importService: ImporterService
  private originalRunes: Array<RuneView>
  runes: Array<RuneView>
  collectionSize: number
  page = 1;
  pageSize = 20;

  @ViewChildren(NgbdSortableHeader) headers:
    QueryList<NgbdSortableHeader>;

  constructor(service: ImporterService) {
    this.importService = service
    this.originalRunes = this.importService.getRunes().map(it => {
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
    this.collectionSize = this.originalRunes.length
    this.runes = [...this.originalRunes]
    this.refreshRuneView()
  }

  ngAfterContentInit(): void {
    
  }
  ngOnInit(): void {
  }

  refreshRuneView() {
    this.runes = this.originalRunes
      .map((rune, i) => ({ id: i + 1, ...rune }))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  onSort({ column, direction }: SortEvent) {

    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '' || column === '') {
      this.runes = this.originalRunes;
    } else {
      this.runes = [...this.originalRunes].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }



}

class RuneView {
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