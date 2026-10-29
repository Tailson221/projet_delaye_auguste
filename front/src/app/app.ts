import { Component } from '@angular/core';
import { PollutionCrudComponent } from './components/pollution-crud/pollution-crud';

@Component({
  selector: 'app-root',
  imports: [PollutionCrudComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
