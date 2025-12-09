import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Access URL from server
  private apiUrl = 'https://copy-relatively-realized-drainage.trycloudflare.com/';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // if the login is a success, we save the token on navigators localStorage
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_role', response.user.role);
      })
    );
  }

  logout() {
    localStorage.clear(); // clears everything
    this.router.navigate(['/auth/login']);
  }

  getToken() {
    // only access in case its from browser
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  // checks if user is already logged in
  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
       return !!localStorage.getItem('access_token');
    }
    return false; // if its server, considers logged out to avoid crashing
  }

  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user_role');
    }
    return null;
  }

  // redirects the user
  redirectUser() {
    const role = this.getRole();

    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'supervisor':
        this.router.navigate(['/supervisor']);
        break;
      case 'user':
        this.router.navigate(['/user']);
        break;
      default:
        // Se algo der errado ou não tiver role, manda pro login ou home genérica
        this.router.navigate(['/auth/login']);
    }
  }
}