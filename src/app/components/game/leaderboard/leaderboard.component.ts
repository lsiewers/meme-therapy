import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { GameStates } from 'src/app/enums/game-states';
import { User } from 'src/app/models/user';
import { GameService } from 'src/app/services/game/game.service';
import { VoteService } from 'src/app/services/game/vote.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  players: User[] = [];
  playerSubscription!: Subscription;
  playerId: string;
  pin: number;
  user: Promise<User>;
  gameSaved = false;
  
  showFeedback = false;
  sentFeedback = false;

  constructor(
    private userService: UserService,
    private gameService: GameService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { 
    this.pin = this.route.parent?.snapshot.params['code'];
    this.playerId = this.userService.currentUserID;
    
    this.user = this.userService.getUser(this.playerId)
      .finally(() => { this.cdr.detectChanges() });
  }

  newRound() {
    this.gameSaved = true;
    // this.gameService.setState(this.pin, GameStates.FORM);
    this.roomService.getCurrentRoom(this.pin).child('gameStarted').set(false).finally(() => {
      this.zone.run(() => this.router.navigate([this.pin.toString(), 'lobby']));
    }); 
  }

  ngOnInit(): void {
    this.playerSubscription = this.userService.getAllUsers().subscribe(players => {
      this.players = players;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.playerSubscription.unsubscribe();
  }
}
