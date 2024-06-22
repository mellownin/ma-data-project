import { Component } from '@angular/core';
import { GatherEnrollmentComponent } from './enrollment/gather-enrollment/gather-enrollment.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GatherEnrollmentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'client';
}
