import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../auth/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  userName: string = 'Usuário';
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Tenta pegar o nome salvo ou do token (ajuste conforme onde você salva o nome)
      // Se não tiver salvo o nome no login, pode usar o email ou uma string padrão
      this.userName = localStorage.getItem('user_name') || 'Colaborador';
      this.userRole = localStorage.getItem('user_role') || '';
    }
  }

  logout() {
    this.authService.logout();
  }
}