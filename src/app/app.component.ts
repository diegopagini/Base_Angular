import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  of,
  skip,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AppComponent implements OnInit, OnDestroy {
  value = signal<number>(0);
  obs$ = new BehaviorSubject<number>(0);
  destroy = new Subject<void>();

  constructor(private readonly _http: HttpClient) {}

  ngOnInit(): void {
    this.obs$
      .asObservable()
      .pipe(
        skip(1),
        tap(console.log),
        debounceTime(3000),
        switchMap((num) => this.callFake(num)),
        takeUntil(this.destroy)
      )
      .subscribe((num) => {
        console.log('number: ', num);
      });
  }

  onClick(): void {
    this.value.update((v) => v + 1);
    this.obs$.next(this.value());
  }

  callFake(value: number) {
    this._http
      .post(`/some/fake-url`, {
        value,
      })
      .subscribe();

    return of(value);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
