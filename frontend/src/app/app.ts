import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackBanner } from './shared/feedback/feedback-banner';
import { SiteHeader } from './shared/layout/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeedbackBanner, SiteHeader],
  templateUrl: './app.html',
})
export class App {}
