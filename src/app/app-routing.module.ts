import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { HomeComponent } from './components/home/home.component';
import { LobbyComponent } from './components/lobby/lobby.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: ':code/lobby',
    component: LobbyComponent,
  },
  {
    path: ':code/game',
    loadChildren: () => import('./components/game/game.module').then(x => x.GameModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    { 
      scrollPositionRestoration: 'enabled'
      // useHash: true,
      // enableTracing: true // <-- debugging purposes only
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
