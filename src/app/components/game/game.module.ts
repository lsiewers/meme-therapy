import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorComponent } from './creator/creator.component';
import { FormComponent } from './form/form.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { TimerComponent } from './timer/timer.component';
import { VotingComponent } from './voting/voting.component';
import { RoundComponent } from './round/round.component';
import { GameRoutingModule } from './game-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalComponent } from '../modal/modal.component';
import { FeedbackComponent } from '../feedback/feedback.component';



@NgModule({
  declarations: [
    FormComponent,
    TimerComponent,
    CreatorComponent,
    VotingComponent,
    LeaderboardComponent,
    RoundComponent,
    ModalComponent,
    FeedbackComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GameModule { }
