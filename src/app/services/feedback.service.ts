import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { RoomService } from './room.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(
    private db: AngularFireDatabase,
  ) { }

  submit(pin: number, playerId: string, feedback: {question: string, answer: string}[]) {
    this.db.list('game-rooms/'+pin+'/feedback').set(playerId, feedback);
  }
}
