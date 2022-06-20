import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: User = new User();
  currentUserID: string = '';
  pin: number = 0;
  ref: AngularFireList<User> = this.db.list('game-rooms/' + this.pin.toString() + '/users');

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute
  ) {
    const storedUserID = localStorage.getItem('userID')
    storedUserID ? this.currentUserID = storedUserID : null;
  }

  async getUser(id: string): Promise<User> {
    return await new Promise((res, rej) => {
      this.db.database.ref('game-rooms/' + this.pin.toString() + '/users/' + id).once('value')
        .then(data => res(data.val() as User))
        .catch(err => rej(err));
    });
  }

  getAllUsers(): Observable<User[]> {
    return new Observable(observer => {
      this.db.database.ref('game-rooms/' + this.pin.toString() + '/users').on('value', data => {
        const users = data.val();
        if(users) {
          const usersArray = Object.keys(users).map((key:any) => {
            const user: User = users[key];
            user.id = key;
            return user;
          });
          observer.next(usersArray)
        }
      });
    });
  }

  getUserList(): Promise<User[]> {
    return new Promise(res => {
      this.db.database.ref('game-rooms/' + this.pin.toString() + '/users/').once('value', data =>{
        const usersList = Object.keys(data.val()).map((key:any) => data.val()[key]);
        res(usersList);
      })
    })
  }

  addUser(user: User) { return this.db.list('game-rooms/' + this.pin.toString() + '/users').push(user); }

  setCurrentUser(userID: string) {
    localStorage.setItem('userID', userID);
    this.currentUserID = userID;
  }

  setUserScore(id: string, value: number) {
    console.log(value);
    const userRef = this.db.database.ref('game-rooms/' + this.pin.toString() + '/users/' + id);
    userRef.child('score').once('value', score => {
      score.val() > 0 ?
        userRef.update({score: (score.val() + value)}).then(newScore => console.log(newScore)) :
        score.ref.set(value).then(newScore => console.log(newScore));
    })
  }

  // watchUsers(): Observable<User[]> {
  //   return this.getAllUsers().snapshotChanges().pipe(
  //     map(changes => {
  //       console.log(changes);
        
  //       return changes.map(c => (({ id: c.payload.key, ...c.payload.val() } as User)));
  //     })
  //   )
  // }
}
