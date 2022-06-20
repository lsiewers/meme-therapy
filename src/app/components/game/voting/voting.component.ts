import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DataSnapshot } from '@angular/fire/database/interfaces';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { GameStates } from 'src/app/enums/game-states';
import { MemeCreation } from 'src/app/models/game/meme-creation';
import { PlayerInput } from 'src/app/models/game/player-input';
import { Vote } from 'src/app/models/game/vote';
import { User } from 'src/app/models/user';
import { GameService } from 'src/app/services/game/game.service';
import { MemeService } from 'src/app/services/game/meme.service';
import { PlayerInputService } from 'src/app/services/game/player-input.service';
import { VoteService } from 'src/app/services/game/vote.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit, OnDestroy {
  memes$: Promise<MemeCreation[]>;
  pin: number;
  playerId: string;

  pointsRightGuess = 1;
  votingTime = 60;

  submitted = false;
  reveal = false;
  continue = false;

  players$: Observable<User[]>;
  playerSubscription!: Subscription;
  playerList: User[] = [];

  watchVotes$: Observable<Vote[]>;
  votesSubscription!: Subscription;
  votes: Vote[] = [];

  inputList: PlayerInput[] = []

  constructor(
    private memeService: MemeService,
    private userService: UserService,
    private voteService: VoteService,
    private inputService: PlayerInputService,
    private gameService: GameService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.pin = this.route.parent?.snapshot.params['code'];
    this.playerId = this.userService.currentUserID;
    
    this.memes$ = this.memeService.getAll(this.pin).then((memes: MemeCreation[]) => <MemeCreation[]>(Object.keys(memes).map((key:any) => memes[key])));
    this.players$ = this.userService.getAllUsers();
    this.watchVotes$ = this.voteService.watchVotesList(this.pin);
  }

  ngOnInit(): void {  
    this.playerSubscription = this.players$.subscribe(players => {
      this.playerList = players;
      if (this.votes.length < this.playerList.length) { this.playerList.forEach(() => this.votes.push(new Vote())); }
    });
    
    this.votesSubscription = this.watchVotes$.subscribe(voteList => {
      // if everyone has submitted
      if (voteList.length >= this.playerList.length) { 
        this.reveal = true; 
        this.cdr.detectChanges();
      }
      // if already submitted before load
      if(voteList.find(vote => vote.playerId === this.playerId)) {
        this.submitted = true;
        this.inputService.getPlayerInputList(this.pin).then(inputList => this.inputList = inputList);
        this.voteService.getPlayerVotes(this.pin, this.playerId).once('value').then(votes => this.votes = Object.keys(votes.val()).map((key:any) => votes.val()[key]))
      }
    });
  }

  getInputById(id: string) {
    const getInput = this.inputList.find(input => input.playerId === id);
    return getInput !== undefined ? getInput : null;
  }

  isRightAnswer(meme: MemeCreation, i: number): boolean { return meme.playerInputId === this.votes[i].guessedPlayerId; }

  getPlayerById(id: string) {
    const getPlayer = this.playerList.find(player => player.id === id);
    return getPlayer !== undefined ? getPlayer : null;
  }

  selectChange(e: Event, memeId: string, playerInputId: string, index: number) {
    if (this.playerList.length) {
      const target = (<HTMLInputElement>e.target);
      this.votes[index] = {
        guessedPlayerId: target.value,
        memeId: memeId,
        playerInputId: playerInputId
      }
    } 
  }

  submitVotes() {
    this.submitted = true
    const score = this.votes.filter(vote => vote.guessedPlayerId === vote.playerInputId).length;
    this.votes.forEach(vote => vote.playerInputId === 'none' ? vote.playerInputId = this.playerId : null);
    this.voteService.submitVotes(this.pin, this.playerList.length, this.playerId, this.votes);
    this.userService.setUserScore(this.playerId, score);
    this.inputService.getPlayerInputList(this.pin)
      .then(list => this.inputList = list)
      .catch(err => alert(err))
      .finally(() => this.cdr.detectChanges())
  }

  timeOver() { if (!this.submitted) { this.submitVotes(); } }

  playerReady() {
    this.continue = true;
    this.gameService.playersReady(this.pin).then(amount => amount >= this.playerList.length ? this.gameService.setState(this.pin, GameStates.LEADERBOARD) : null);
  }

  ngOnDestroy(): void {
    this.votesSubscription.unsubscribe();
    this.playerSubscription.unsubscribe();
  }
}
