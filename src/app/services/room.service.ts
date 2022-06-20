import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Room } from '../models/room';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  currentRoom: Room = new Room(); 
  pin = 0;
  dbPath = 'game-rooms/';
  ref: AngularFireList<Room> = this.db.list(this.dbPath);

  constructor(
    private db: AngularFireDatabase,
    private userService: UserService
  ) { }

  getAllRooms() {
    return this.db.database.ref(this.dbPath).once('value');
  }

  setPin(pin: number): Promise<any> {
    return new Promise(res => {
      this.userService.pin = pin;
      res(this.pin = pin)
    });
  }

  createRoom(room: Room): Promise<any> {
    return new Promise((res, rej) => {
      if (room.pin) {
        this.currentRoom = room;
        this.pin = room.pin;
        res(this.ref.set(room.pin.toString(), room)); 
      } else { rej('room pin undefined while creating') };
    })
  }

  joinRoom(pin: number, user: User): Promise<any> {
    return new Promise((res, rej) => {
      if(user) {
        const roomPath = this.db.database.ref(this.dbPath).child(pin.toString());
        roomPath.once('value', (room: any) => this.currentRoom = room)
          .then(() => {
            const pushUser = this.userService.addUser(user);
            pushUser.then(user => pushUser.key !== null ? this.userService.setCurrentUser(pushUser.key) : null);
            res(pushUser);
          })
          .catch(() => 'cant get room value in joinRoom func')
      } else { rej('current user undefined while joining') }
    })
  }

  getCurrentRoom(pin: number) {
    return this.db.database.ref(this.dbPath).child(pin.toString());
  }
  
  // generate unique pin based on existing pins
  async generateUniquePin(): Promise<number> {
    const rooms: any[] = [];
    let genPin;
    return new Promise(res => {
      this.getAllRooms()
      .then(rooms => (rooms.val() as Room[]).forEach(room => rooms.ref.push(room.pin)))
      .finally(() => {
        do { genPin = Math.floor(Math.random() * (9999 - 1000) + 1000); // n + 1 
        } while (rooms.includes(genPin));
        res(genPin);
      })
    })
    
  }
}
