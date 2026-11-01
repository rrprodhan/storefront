import { Component, inject } from '@angular/core';
import { FeedbackService } from './feedback.service';

@Component({
  selector: 'app-feedback-banner',
  templateUrl: './feedback-banner.html',
})
export class FeedbackBanner {
  readonly feedback = inject(FeedbackService);
}
