import { Component } from '@angular/core';
import { AuthService } from '../auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  credentials = {
    email: '',
    password: ''
  };

  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        console.log('User Loged in!', res);
        this.authService.redirectUser();
      },
      error: (err) => {
        console.error('Error trying to login', err);
        this.errorMessage = 'Email or password invalid';
      }
    });
  }

}
