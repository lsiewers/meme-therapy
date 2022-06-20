import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameStates } from 'src/app/enums/game-states';
import { MemeCreation } from 'src/app/models/game/meme-creation';
import { PlayerInput } from 'src/app/models/game/player-input';
import { User } from 'src/app/models/user';
import { GameService } from 'src/app/services/game/game.service';
import { MemeService } from 'src/app/services/game/meme.service';
import { PlayerInputService } from 'src/app/services/game/player-input.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss']
})
export class CreatorComponent implements OnInit, OnDestroy {
  pin: number;
  currentPlayerID;
  playerInput = new PlayerInput();
  memeCreation = new MemeCreation();
  retrievedInput: Promise<PlayerInput>;
  image: string | ArrayBuffer = '';
  memesList: MemeCreation[] = [];
  users: User[] = [];
  memeSubmitted = false;

  watchMemeListSubscription!: Subscription;

  constructor(
    private playerInputService: PlayerInputService,
    private userService: UserService,
    private roomService: RoomService,
    private memeService: MemeService,
    private gameService: GameService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { 
    this.pin = this.route.parent?.snapshot.params['code'];
    this.currentPlayerID = this.userService.currentUserID;
    
    this.retrievedInput = this.playerInputService.getPlayerInput(this.pin, this.currentPlayerID);
    this.retrievedInput.then(playerInput => {
      this.playerInput = playerInput;
      this.cdr.detectChanges;
    });
    this.roomService.getCurrentRoom(this.pin).child('users').once('value', users => {
      const val = users.val();
      this.users = (Object.keys(val).map((key:any) => val[key]) as User[])
    })
  }

  ngOnInit(): void {
    this.memeService.watchMemeList(this.pin).subscribe(memes => {
      if(memes) {
        this.memesList = Object.keys(memes).map((key:any) => memes[key]);
        const submittedMeme = this.memesList.find(meme => meme.creatorId === this.currentPlayerID);     
        if (submittedMeme !== undefined) {
          this.memeSubmitted = true;
          this.memeCreation = submittedMeme;
        }
        
        this.memesList.length >= this.users.length ? this.gameService.setState(this.pin, GameStates.VOTE) : null;
      }
    });
  }

  onFileChanged(event: Event) {
    const files = (<HTMLInputElement>event.target).files;
    if(files) {
      if (files.length === 0)
          return;

      const mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
          // this.message = "Only images are supported.";
          return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(files[0]); 
      reader.onload = (_event) => reader.result !== null ? this.memeCreation.meme = reader.result : null;
    }
}

  submitMeme() {
    this.memeCreation.creatorId = this.currentPlayerID;
    this.memeCreation.playerInputId = this.playerInput.playerId;
    this.memeCreation.input = this.playerInput.value;
    this.memeService.uploadMeme(this.pin, this.memeCreation);
  }

  timeOver() { this.submitMeme() }

  ngOnDestroy(): void {
    if (this.watchMemeListSubscription !== undefined) {
      this.watchMemeListSubscription.unsubscribe();
    }
  }
}
