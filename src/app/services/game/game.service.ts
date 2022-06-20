import { Injectable } from '@angular/core';
import { Game } from '../../models/game/game';
import { AngularFireDatabase } from '@angular/fire/database';
import { GameStates } from '../../enums/game-states';
import { Observable } from 'rxjs';
import { DataSnapshot } from '@angular/fire/database/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game = new Game();

  constructor( private db: AngularFireDatabase) { 
  }

  createGame(pin: number) {
    this.db.list('game-rooms/' + pin.toString() + '/game');
  }

  setState(pin: number, state: GameStates) {
    this.db.list('game-rooms/' + pin.toString() + '/game').set('state', state);
  }

  watchState(pin: number): Observable<GameStates> {
    return new Observable(observer => {
      this.db.database.ref('game-rooms/' + pin.toString() + '/game').child('state').on('value', state => observer.next(state.val()))
    })    
  }

  playersReady(pin: number): Promise<number> {
    return new Promise(res =>{
      let newVal = 0;
      this.db.database.ref('game-rooms/' + pin.toString() + '/game/playersReady').transaction(val => {
        newVal = val + 1;
        return newVal;
      }).finally(() => res(newVal));
    });
  }

  watchPlayersReady(pin: number): Observable<number> {
    return new Observable(observer => {
      this.db.database.ref('game-rooms/' + pin.toString() + '/game/playersReady').on('value', val => observer.next(val.val()));
    })
  }

  resetPlayersReady(pin: number) {
    this.db.database.ref('game-rooms/' + pin.toString() + '/game/playersReady').set(0);
  }

  getStoredGameData(pin: number): Promise<DataSnapshot> {
      return this.db.database.ref('saved-games/' + pin.toString()).get();
  }

  storeGameData(pin: number) {
    const roomRef = this.db.database.ref('game-rooms/' + pin.toString());
    roomRef.child('game').get().then(game => {
      this.db.database.ref('saved-games/' + pin.toString()).push().set(game.val());
    }).finally(() => {
      this.clearGameData(pin);
    })
  }

  clearGameData(pin: number) {    
    const roomRef = this.db.database.ref('game-rooms/' + pin.toString());
    roomRef.child('game').remove();
  }
}
