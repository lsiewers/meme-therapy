import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { GameStates } from 'src/app/enums/game-states';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {
  gameState: GameStates = GameStates.FORM;
  description: string = '';
  title: string = '';
  time = 30;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.gameState = this.route.snapshot.params['gamestate'];
    if (this.gameState === GameStates.FORM) {
      this.title = 'reflect';
      this.description = "It's time to dig up some shit. Try to come up with an honest answer in time! Keep it secret for now.";
      this.time = 10;
    }
    else if (this.gameState === GameStates.CREATION) {
      this.title = 'meme time';
      this.description = "Now you'll receive an answer of a random other player. Find a meme that fits this answer the best! Open a new tab, save the meme and upload it.";
      this.time = 15;
    }
    else if (this.gameState === GameStates.VOTE) {
      this.title = 'vote';
      this.description = "Your memes will be revealed and you have to find out which meme represents which person's answer.";
      this.time = 15;
    }
    else if (this.gameState === GameStates.LEADERBOARD) {
      this.title = 'Scores';
      this.description = "Let's have a look at your scores";
      this.time = 5;
    }
  }

  timeOver() {
    this.zone.run(() => this.router.navigate([this.roomService.pin, 'game', this.gameState]));
  }
}
