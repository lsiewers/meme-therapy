import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MemeCreation } from 'src/app/models/game/meme-creation';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatabaseReference } from '@angular/fire/database/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MemeService {

  constructor(
    private db: AngularFireDatabase,
  ) { }

  async getAll(pin: number): Promise<MemeCreation[]> {
    return await new Promise(res => {
      this.db.database.ref('game-rooms/' + pin.toString() + '/game/memeCreations').once('value', memes => 
        res(memes.val() as MemeCreation[])
      );
    })
  }

  uploadMeme(pin: number, meme: MemeCreation): Promise<MemeCreation[]> {
    return new Promise(res => {
      const newRef: DatabaseReference = this.db.database.ref('game-rooms/' + pin.toString() + '/game/memeCreations').push();
      const newKey = newRef.key;
      newKey !== null ? meme.id = newKey : null;
      newRef.set(meme);
    });
  }

  watchMemeList(pin: number): Observable<MemeCreation[]> {
    return new Observable(observer => {
      this.db.database.ref('game-rooms/' + pin.toString() + '/game/memeCreations').on('value', memes =>
        observer.next(memes.val())
      );
    })
  }
}
