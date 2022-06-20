import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { RoomService } from 'src/app/services/room.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  nameInput = ''; pinInput = '';
  newGame = false;
  error = '';
  room = new Room();
  user = new User();
  checkedPin = 0;

  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private router: Router,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
  }

  // Checks if room with entered code exists
  checkPin(): Promise<Boolean> {
    return new Promise((res, rej) => this.ifRoomExists(Number(this.pinInput))
      .then(() => {
        this.checkedPin = Number(this.pinInput);
        res(true)
      }).catch(err => this.error = err));
  }

  ifRoomExists(pin: number): Promise<any> {
    return new Promise((res, rej) => {
      // check if room with pin already exists
      this.roomService.getAllRooms().then((data) => {
        const rooms = data.val();
        if(rooms) {
          Object.keys(rooms).find(room => Number(room) === pin) ?
          res(true) : rej('room does not exist');
        } else {
          rej('no rooms at all')
        }
      });
    });
  }

  joinRoom() {
    this.user.name = this.nameInput;
    const pin = this.room.pin | this.checkedPin;
    this.roomService.setPin(pin).then(() => this.roomService.joinRoom(pin, this.user));
    this.zone.run(() => this.router.navigate([pin, 'lobby'], { state: {user: this.userService.currentUserID }}));
  }

  createNewRoom() {
    this.user.isHost = true;
    this.roomService.generateUniquePin().then(newPin => {
      this.room.pin = newPin;
      this.roomService.createRoom(this.room)
        .then(() => this.joinRoom())
        .catch(err => console.log(err));
    })
  }
}
