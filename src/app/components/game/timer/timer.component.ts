import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { interval, Observable, timer } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  @Input() countdownTime: number = 0;
  @Input() warningTime: number = 0;
  @Input() showText = true;
  @Input() color: 'black' | 'white' = 'black';
  @Output() timeOver = new EventEmitter();
  count = 0;
  counter$!: Observable<number>;
  startWarning = 0;
  currentUser!: User;
  url = '';

  constructor() { }

  ngOnInit(): void {
    this.count = this.countdownTime;
    this.startWarning = this.warningTime;
    this.counter$ = this.countdown();
  }

  countdown(): Observable<number> {
    return timer(0,1000).pipe(take(this.count), map(() => this.count > 0 ? --this.count : 0));
  }
 
  timeToPercentage(): number {
    return this.countdownTime > 0 ? 100 / this.countdownTime * this.count : 0;
  }

  warn(): boolean { 
    this.checkIfTimeOver();
    return this.count <= this.startWarning; 
  }

  async checkIfTimeOver(): Promise<any> {
    return await new Promise((res: any) => {
      if (this.count === 0) {
        this.count = -1; // prevent infinite loop
        setTimeout(() => {res(this.timeOver.emit('time over'))}, 1000);
      }
    });
  };
}
