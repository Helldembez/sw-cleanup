/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { Injectable, PipeTransform } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { SortColumn, SortDirection } from './sortable.directive';
import { ImporterService } from '../services/importer.service';
import { RuneView } from './models/rune-view';

interface SearchResult {
    runes: RuneView[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    build: string;
    set: string;
    action: string;
    slot: number;
    level: number;
    mainstat: string;
    location: string;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(runes: RuneView[], column: SortColumn, direction: string): RuneView[] {
    if (direction === '' || column === '') {
        return runes;
    } else {
        return [...runes].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function cmp_str(a: string, b: string) {
    return (b.length > 0 && a !== b)
}

function includes_str(a: string, b: string) {
    return (b.length > 0 && !a.toLowerCase().includes(b.toLowerCase()))
}

function cmp_num(a: number, b: number, match: boolean) {
    return match ? (b > 0 && a != b) : (b > 0 && a < b)
}

function matches(rune: RuneView, state: State, pipe: PipeTransform) {
    return !(
        cmp_str(rune.build, state.build) ||
        cmp_str(rune.set, state.set) ||
        cmp_str(rune.action, state.action) ||
        cmp_str(rune.mainstat.split(' ')[1], state.mainstat) ||
        cmp_num(rune.slot, state.slot, true) ||
        cmp_num(rune.level, state.level, false) ||
        includes_str(rune.location, state.location)
    )
}

@Injectable({ providedIn: 'root' })
export class RuneService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _search$ = new Subject<void>();
    private _runes$ = new BehaviorSubject<RuneView[]>([]);
    private _total$ = new BehaviorSubject<number>(0);
    private originalRunes: Array<RuneView>

    private _state: State = {
        page: 1,
        pageSize: 20,
        build: '',
        set: '',
        action: '',
        slot: 0,
        level: 0,
        mainstat: '',
        location: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe, service: ImporterService) {
        this.originalRunes = [...service.getRunes()]
        console.log(this.originalRunes.length)
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).subscribe(result => {
            this._runes$.next(result.runes);
            this._total$.next(result.total);
        });

        this._search$.next();
    }

    get runes$() { return this._runes$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get build() { return this._state.build; }
    get set() { return this._state.set; }
    get action() { return this._state.action; }
    get slot() { return this._state.slot; }
    get level() { return this._state.level; }
    get mainstat() { return this._state.mainstat; }
    get location() { return this._state.location; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set build(build: string) { this._set({ build }); }
    set set(set: string) { this._set({ set }); }
    set action(action: string) { this._set({ action }); }
    set slot(slot: number) { this._set({ slot }); }
    set level(level: number) { this._set({ level }); }
    set mainstat(mainstat: string) { this._set({ mainstat }); }
    set location(location: string) { this._set({ location }); }
    set sortColumn(sortColumn: SortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        this._search$.next();
    }

    private _search(): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page } = this._state;

        let runes = sort(this.originalRunes, sortColumn, sortDirection);

        runes = runes.filter(country => matches(country, this._state, this.pipe));

        const total = runes.length;

        runes = runes.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        return of({ runes, total });
    }

    clear() {
        this._state.action = ''
        this._state.build = ''
        this._state.set = ''
        this._state.slot = 0
        this._state.level = 0
        this._state.mainstat = ''
        this._state.location = ''
        this._search$.next();
    }
}
