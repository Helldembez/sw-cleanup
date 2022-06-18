import { DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { RuneSet, Stat, BuildType } from '../global/models';
import { RuneView } from './models/rune-view';
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

