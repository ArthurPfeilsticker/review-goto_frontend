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
  
  // Form control
  showForm = false;
  isEditMode = false;
  currentUser: any = { name: '', email: '', password: '', role: 'user' };

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        // defining weight to roles
        const rolePriority: { [key: string]: number } = {
          'admin': 1,
          'supervisor': 2,
          'user': 3
        };

        // put in order
        this.users = data.sort((a: any, b: any) => {
          //gets the role weight or if unknown throw it to the end
          const priorityA = rolePriority[a.role] || 99;
          const priorityB = rolePriority[b.role] || 99;

          // compares roles
          if (priorityA < priorityB) return -1; // A vem antes
          if (priorityA > priorityB) return 1;  // B vem antes

          // if same role, compare names
          // localeCompare makes sure acentuation is compared properly
          return a.name.localeCompare(b.name);
        });

        // 3. Força a atualização da tela
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Erro no navegador:', e)
    });
  }

  openCreate() {
    this.isEditMode = false;
    this.currentUser = { name: '', email: '', password: '', role: 'user' };
    this.showForm = true;
  }

  openEdit(user: any) {
    this.isEditMode = true;
    // copies object to avoid editing table directly in real time before saving
    this.currentUser = { ...user, password: '' }; 
    this.showForm = true;
  }

  deleteUser(id: number) {
    if(confirm('Tem certeza que deseja excluir?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  onSubmit() {
    if (this.isEditMode) {
      this.userService.updateUser(this.currentUser.id, this.currentUser).subscribe(() => {
        this.loadUsers();
        this.showForm = false;
      });
    } else {
      this.userService.createUser(this.currentUser).subscribe(() => {
        this.loadUsers();
        this.showForm = false;
      });
    }
  }
}