import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  users: any[] = [];

  isSaving = false;
  
  // Controle do Modal
  showForm = false;
  isEditMode = false;
  currentUser: any = { name: '', email: '', password: '', role: 'user' };

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        // Ordenação: Admin > Supervisor > User, depois Alfabética
        const rolePriority: { [key: string]: number } = { 'admin': 1, 'supervisor': 2, 'user': 3 };
        
        this.users = data.sort((a: any, b: any) => {
          const priorityA = rolePriority[a.role] || 99;
          const priorityB = rolePriority[b.role] || 99;
          if (priorityA !== priorityB) return priorityA - priorityB;
          return a.name.localeCompare(b.name);
        });

        this.cdr.detectChanges();
      },
      error: (e) => console.error('Erro ao carregar:', e)
    });
  }

  openCreate() {
    this.isEditMode = false;
    this.currentUser = { name: '', email: '', password: '', role: 'user' };
    this.showForm = true;
  }

  openEdit(user: any) {
    this.isEditMode = true;
    this.currentUser = { ...user, password: '' }; 
    this.showForm = true;
  }

  deleteUser(id: number) {
    if(confirm('Tem certeza que deseja excluir este usuário?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  onSubmit() {
    this.isSaving = true; // 1. Bloqueia o botão e mostra o spinner

    const action$ = this.isEditMode 
      ? this.userService.updateUser(this.currentUser.id, this.currentUser)
      : this.userService.createUser(this.currentUser);

    action$.subscribe({
      next: () => {
        this.loadUsers();
        this.showForm = false;
        this.isSaving = false; // 2. Libera em caso de sucesso
      },
      error: (err) => {
        console.error('Erro ao salvar:', err);
        alert('Ocorreu um erro ao salvar o usuário.');
        this.isSaving = false; // 3. Libera também em caso de erro!
      }
    });
  }
}