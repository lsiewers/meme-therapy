import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameStates } from 'src/app/enums/game-states';
import { PlayerInput } from 'src/app/models/game/player-input';
import { User } from 'src/app/models/user';
import { GameService } from 'src/app/services/game/game.service';
import { PlayerInputService } from 'src/app/services/game/player-input.service';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {
  user = new User();
  pin: number;
  answerSubmitted = false;
  negativeFeelings = ['tensed', 'stressed', 'depressed', 'tired', 'sad', 'angry', 'insecure', 'negative', 'helpless', 'afraid', 'suppressed', 'useless'];
  inspiration = 'Anything but feeling completely free of conflict and very happy';
  // negativeFeelings = What makes you [procrastinating, overthinking, over-reacting, forcing yourself, pretending to be better, people pleasing, getting aggressive, feel frozen] lately? 
  // inspiration = '(Anything but being your actual self)';
  negativeFeeling = '';
  playerInput = new PlayerInput();
  getUsersSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private playerInputService: PlayerInputService,
    private gameService: GameService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { 
    this.pin = this.route.parent?.snapshot.params['code'];
    this.playerInput.playerId = this.userService.currentUserID;
  }

  ngOnInit(): void {
    this.setNewNegativeFeeling();
    setInterval(()=> {
      this.setNewNegativeFeeling();
    }, 10000)
  }

  submitInput() {
    this.playerInputService.submitPlayerInput(this.pin, this.playerInput).then(() => {
      this.answerSubmitted = true;
      this.cdr.detectChanges();
      
      this.playerInputService.getPlayerInputList(this.pin).then(list => {
        this.getUsersSubscription = this.userService.getAllUsers().subscribe(users => {
          //  last player to upload...
          if (Object.keys(users).length === Object.keys(list).length) {
            this.gameService.setState(this.pin, GameStates.CREATION);
            this.playerInputService.assignPlayerInputs(this.pin);
          }
        })
      })
    }).catch(err => console.log(err));
  }

  timeOver() {
    this.submitInput();
  }

  setNewNegativeFeeling() {
    this.negativeFeeling = this.negativeFeelings[Math.floor(Math.random()  * this.negativeFeelings.length)]
  }

  ngOnDestroy(): void {
    this.getUsersSubscription !== undefined ? this.getUsersSubscription.unsubscribe() : null;
  }
}
