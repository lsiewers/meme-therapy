import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FeedbackService } from 'src/app/services/feedback.service';
import { GameService } from 'src/app/services/game/game.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  @Output() feedbackSubmit = new EventEmitter();
  @Input() playerId = '';
  @Input() pin = 0;
  error = '';
  questions = [
    {
      question: 'Wat vind je van het spel?',
      answer: ''
    },
    {
      question: 'Heb je iets gedeeld waar je écht mee zit/mee gezeten hebt? Hoezo wel/niet?',
      answer: ''
    },
    {
      question: 'is je blik op de situatie die je ingevuld hebt veranderd door de meme? Zo ja, wat is er anders?',
      answer: ''
    },
    {
      question: 'denk je dat memes kunnen helpen met het relativeren van problemen of stress?',
      answer: ''
    },
    {
      question: 'hoe vaak en hoe deel je stress/problemen/onzekerheden met anderen?',
      answer: ''
    },
    {
      question: 'Was er iets waar je moeite mee had tijdens het spel? Zo ja, wat?',
      answer: ''
    },
    {
      question: 'heb je behoefte om het vaker/makkelijker te delen?',
      answer: ''
    },
    {
      question: 'Zie je potentie in dit concept en heb je evt suggesties hoe het spel beter/effectiever/leuker kan worden?',
      answer: ''
    },
    {
      question: 'Zou je dit spel aanraden bij vrienden/kennissen/mede-studenten/collegas? Waarom wel/niet?',
      answer: ''
    }
  ]

  constructor(
    private feedbackService: FeedbackService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
  }

  submitFeedback() {
    const notAnswered = this.questions.find(q => q.answer === '');
    if (notAnswered) {
      this.error = 'Not every question is answered yet'
    } else {
      this.feedbackService.submit(this.pin, this.playerId, this.questions);
      this.feedbackSubmit.emit('feedback sent');
      this.gameService.getStoredGameData(this.pin).then(data => {
        if(data.val()) { return }
        else {
          console.log('store game');
          this.gameService.storeGameData(this.pin);
        }
      })
    }
  }

}
