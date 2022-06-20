import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { GameStates } from 'src/app/enums/game-states';
import { Game } from 'src/app/models/game/game';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { GameService } from 'src/app/services/game/game.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnDestroy, OnInit {
  pin: number;
  game = new Game();
  players: User[] = [];
  playerSubscription!: Subscription;
  gameStarted$: Observable<boolean>;
  gameStartedSubscription!: Subscription;

  userID: string;
  isHost = false;
  user: User = new User();
  
  playerAmount = 0;
  maxPlayerAmount: number;
  minPlayerAmount: number;

  constructor(
    private roomService: RoomService,
    private gameService: GameService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
    ) {
    const userID = history.state.user;
    userID !== undefined ? this.userService.setCurrentUser(userID) : null;
    this.userID = this.userService.currentUserID;
    
    const pin = this.route.snapshot.params['code'];
    this.pin = pin; 
    this.userService.pin = pin;
    
    console.log(this.userService.currentUserID);

    this.maxPlayerAmount = this.game.maxPlayerAmount;
    this.minPlayerAmount = this.game.minPlayerAmount;
    
    this.gameStarted$ = this.watchGameStarted();
  }

  ngOnInit(): void {
    this.gameStartedSubscription = this.gameStarted$.subscribe(started => started ? this.loadGame() : null);
    this.playerSubscription = this.userService.getAllUsers().subscribe(players => {
      this.userService.getUser(this.userService.currentUserID).then(user => this.user = user);
      this.playerAmount = Object.keys(players).length;
      this.players = players;
      this.cdr.detectChanges();
    });
  }

  watchGameStarted(): Observable<boolean> {
    return new Observable(observer => {
      this.roomService.getCurrentRoom(this.pin).child('gameStarted').on('value', data => {
        observer.next(data.val());
      });
    });
  }
  
  loadGame() {
    this.gameService.setState(this.pin, GameStates.FORM);
    this.roomService.getCurrentRoom(this.pin).child('gameStarted').set(true); 
    this.zone.run(() => this.router.navigate([this.pin.toString(), 'game'], {queryParams: {user: this.userID}}));
  }

  ngOnDestroy(): void {
    this.gameStartedSubscription.unsubscribe();
    this.playerSubscription.unsubscribe();
  }
}
