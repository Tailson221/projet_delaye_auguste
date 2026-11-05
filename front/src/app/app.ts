import { Component, inject, signal } from '@angular/core';
import { PollutionCrudComponent } from './components/pollution-crud/pollution-crud';
import { UserManagementComponent } from './components/user-management/user-management';
import { PollutionService } from './services/pollution.service';
import { UserService } from './services/user.service';
import { HttpTrafficService } from './services/http-traffic.service';

@Component({
  selector: 'app-root',
  imports: [PollutionCrudComponent, UserManagementComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly pollutionService = inject(PollutionService);
  readonly userService = inject(UserService);
  readonly trafficService = inject(HttpTrafficService);

  readonly currentTab = signal<'pollutions' | 'users'>('pollutions');

  readonly isMockActive = this.trafficService.isMockActive;
  readonly currentUser = this.userService.currentUser;
  readonly pollutionCount = this.pollutionService.totalCount;
  readonly userCount = this.userService.totalUsersCount;

  switchTab(tab: 'pollutions' | 'users'): void {
    this.currentTab.set(tab);
  }

  toggleApiMode(): void {
    this.trafficService.toggleMockMode();
  }
}
