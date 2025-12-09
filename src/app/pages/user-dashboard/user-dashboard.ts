import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {

}
