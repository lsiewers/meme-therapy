import { Injectable } from '@angular/core';
import { PlayerInput } from '../../models/game/player-input';
import { AngularFireDatabase } from '@angular/fire/database';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerInputService {

  constructor(
    private db: AngularFireDatabase,
    private userService: UserService,
  ) { }

  submitPlayerInput(pin: number, input: PlayerInput): Promise<any> {
    return new Promise((res, rej) => {
      if(input.playerId) {
        const dbPath = this.db.list('game-rooms/' + pin.toString() + '/game/playerInputs');
        // dbPath.set('.indexOn', ['playerId']);
        dbPath.query.orderByChild('playerId').equalTo(input.playerId).once('value').then(existing => {
          if(existing.val() === null) {
            dbPath.push(input);
            res(true);
          } else { rej('already something uploaded by this user'); }
        }).catch(() => {
          dbPath.push(input)
          res(true);
        });
      }
    }).catch(err => err);
  }

  assignPlayerInputs(pin: number) {
    // 1. get all player inputs
    const playerList: string[] = [];
    let combos: {playerID: string, inputPlayerID: string}[] = [];
    this.getPlayerInputList(pin).then(list => {
      list.forEach(input => input.playerId !== undefined ? playerList.push(input.playerId) : null);
      const assigned = new Set;
      let randomIndex;
      do {
        assigned.clear(); combos = [];
        playerList.forEach((player, i) => {
          randomIndex = Math.floor(Math.random() * playerList.length);
          const sameAsUser = i === randomIndex;
          if(!assigned.has(randomIndex) && !sameAsUser) { assigned.add(randomIndex); }
          combos.push({playerID: player, inputPlayerID: playerList[randomIndex]});
        });
      } while (assigned.size < playerList.length)
      combos.forEach(combo => {
        const dbPath = this.db.list('game-rooms/' + pin.toString() + '/game/playerInputs');
        dbPath
          .query.orderByChild('playerId').equalTo(combo.playerID).once('value', snapshot => {
            const id = Object.keys(snapshot.val())[0];
            
            this.db.list('game-rooms/' + pin.toString() + '/game/playerInputs/'+id).set('assignedPlayerId', combo.inputPlayerID);;
          })
      });
    });
  }

  getPlayerInputList(pin: number): Promise<PlayerInput[]> {
    return new Promise((res, rej) => {
      this.db.database.ref('game-rooms/' + pin.toString() + '/game/playerInputs').once('value')
        .then(data => {
          const listToArray = Object.keys(data.val()).map((key:any) => data.val()[key]);
          res(listToArray)
        })
        .catch(err => rej(err));
    })
  }

  getPlayerInput(pin: number, assignedPlayerId: string): Promise<PlayerInput> {
    const dbPath = this.db.list('game-rooms/' + pin.toString() + '/game/playerInputs');
    return new Promise(res => {
      dbPath.query.orderByChild('assignedPlayerId').equalTo(assignedPlayerId).once('value').then(data => {
        const toArray = Object.keys(data.val()).map((key:any) => data.val()[key]);

        res(toArray[0] as PlayerInput)
      });
    });
  }
}
