import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PollutionService } from './services/pollution.service';
import { UserService } from './services/user.service';
import { HttpTrafficService } from './services/http-traffic.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly pollutionService = inject(PollutionService);
  readonly userService = inject(UserService);
  readonly trafficService = inject(HttpTrafficService);

  readonly isMockActive = this.trafficService.isMockActive;
  readonly currentUser = this.userService.currentUser;
  readonly pollutionCount = this.pollutionService.totalCount;
  readonly userCount = this.userService.totalUsersCount;

  toggleApiMode(): void {
    this.trafficService.toggleMockMode();
  }
}
