import { Score } from "./game/score";

export class User {
  id?: string | null;
  name?: string;
  score = 0;
  isHost = false;
}
