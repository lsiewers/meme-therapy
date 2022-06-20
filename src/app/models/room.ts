import { Game } from "./game/game";
import { User } from "./user";

export class Room {
  pin: number = 0;
  gameStarted: boolean = false;
  users: User[] = [];
  game?: Game = new Game();
}
