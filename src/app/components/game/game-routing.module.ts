import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameStates } from 'src/app/enums/game-states';
import { CreatorComponent } from './creator/creator.component';
import { FormComponent } from './form/form.component';
import { GameComponent } from './game.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { RoundComponent } from './round/round.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
  { 
    path: '', 
    component: GameComponent,
    children: [
      { path: 'round/:gamestate', component: RoundComponent},
      { path: GameStates.FORM, component: FormComponent},
      { path: GameStates.CREATION, component: CreatorComponent},
      { path: GameStates.VOTE, component: VotingComponent},
      { path: GameStates.LEADERBOARD, component: LeaderboardComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
