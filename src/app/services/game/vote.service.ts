import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { Vote } from 'src/app/models/game/vote';
import { MemeService } from './meme.service';

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(
    private db: AngularFireDatabase,
    private memeService: MemeService,
  ) { }

  submitVotes(pin: number, playerAmount: number, playerId: string, votes: Vote[]) {
    this.getPlayerVotes(pin, playerId).once('value', data => {
      const obj = data.val();
      if (obj) {
        const votesList = Object.keys(obj).map((key: any) => obj[key]);
        if(votesList.length >= playerAmount) { return; }
      }
      votes.forEach(vote => this.getPlayerVotes(pin, playerId).push(vote));
    })  
  }

  getPlayerVotes(pin: number, playerId: string) {
    return this.db.database.ref('game-rooms/' + pin.toString() + '/game/playerVotes/' + playerId);
  }

  watchVotesList(pin: number): Observable<Vote[]> {
    return new Observable(observer => {
      this.db.database.ref('game-rooms/' + pin.toString() + '/game').child('playerVotes').on('value', votes => {
        let list = votes.val();
        if(list !== null) {
          list = Object.keys(list).map((key:any) => {
            const item = list[key];
            item.playerId = key;
            return item;  
          })
          observer.next(list);
        }
      })
    });
  };
}
