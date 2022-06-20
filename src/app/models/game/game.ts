import { GameStates } from "../../enums/game-states";
import { MemeCreation } from "./meme-creation";
import { PlayerInput } from "./player-input";
import { Vote } from "./vote";

export class Game {
  state?: GameStates;
  maxPlayerAmount = 6;
  minPlayerAmount = 3;
  playerInputs?: PlayerInput[];
  memeCreations?: MemeCreation[];
  votes?: Vote[];
  playersReady = 0;
  dateTimeStarted = new Date().getDate();
}
