import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para pipes/diretivas
import { AuthService } from '../../../auth/auth-service'; // Ajuste o caminho se necessário
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  
  userRole: string | null = '';
  userName: string = 'Usuário'; // Futuramente pegaremos do token decodificado

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Ao iniciar o componente, descobrimos quem é o usuário
    this.userRole = this.authService.getRole();
    
    // Pequena lógica visual para ficar bonito
    if (this.userRole === 'admin') this.userName = 'Administrador';
    if (this.userRole === 'supervisor') this.userName = 'Supervisor';
    if (this.userRole === 'user') this.userName = 'Colaborador';
  }

  onLogout() {
    this.authService.logout();
  }
}