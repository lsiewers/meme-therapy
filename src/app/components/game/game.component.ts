import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { GameStates } from 'src/app/enums/game-states';
import { User } from 'src/app/models/user';
import { GameService } from 'src/app/services/game/game.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  userID: string;
  pin: number;
  user = new User();
  playerList: User[] = []

  currentState: GameStates;
  newState: GameStates = GameStates.FORM;
  started = true;
  playersReadyAmount = 0;

  gameState$: Observable<GameStates>;
  gameStateSubscription!: Subscription;
  watchPlayersSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private gameService: GameService,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone
  ) {
    this.pin = this.route.snapshot.params['code'];
    this.currentState = this.router.url.substring(this.router.url.length - 1) as GameStates; 
    
    const userID = history.state.user;
    userID !== undefined ? this.userService.setCurrentUser(userID) : null;
    this.userID = this.userService.currentUserID;
    
    if(this.userID) { this.initiate() }
    this.gameState$ = this.gameService.watchState(this.pin);
    this.userService.getUserList().then(users => this.playerList = users);
  }

  ngOnInit(): void {
    this.watchGameEnded();
    this.gameStateSubscription = this.gameState$.subscribe(state => {
      state !== this.currentState && state !== null ?
        this.routeOnStateChange(state) : null;
    })

    this.watchPlayersSubscription = this.gameService.watchPlayersReady(this.pin).subscribe(amount => this.playersReadyAmount = amount);
  }

  initiate(): Promise<any> {
    return new Promise(res => {
      this.roomService.setPin(this.pin).then(() => {
        this.userService.getUser(this.userID).then(user => {        
          this.userService.currentUser = user;
          this.user = user;
          res(true);
        })
        .catch(err => console.error(err))
      });
    });
  }

  routeOnStateChange(state: GameStates) {
    console.log(this.playerList.length, this.playersReadyAmount, state);
    
    if (this.started && this.playerList.length >= this.playersReadyAmount) {
      this.currentState = state;
      this.gameService.resetPlayersReady(this.pin);
      this.currentState === GameStates.LEADERBOARD ?
        this.zone.run(() => this.router.navigate([state], { relativeTo: this.route })).then(() => console.log(this.currentState)) :
        this.zone.run(() => this.router.navigate(['round', state], { relativeTo: this.route })).then(() => console.log(this.currentState))
    }
  }

  watchGameEnded() {
    this.roomService.getCurrentRoom(this.pin).child('gameStarted').on('value', val => {
      if (val.val() === false) {
        this.started = false;
        this.zone.run(() => this.router.navigate([this.pin.toString(), 'lobby']));
      }
    });
  }

  ngOnDestroy(): void {
    this.gameService.storeGameData(this.pin);
    this.gameStateSubscription.unsubscribe();
    this.watchPlayersSubscription.unsubscribe();
  }
}
