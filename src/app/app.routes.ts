import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { SupervisorDashboard } from './pages/supervisor-dashboard/supervisor-dashboard';
import { UserDashboard } from './pages/user-dashboard/user-dashboard';
import { guestGuard } from './auth/guards/guest-guard';

export const routes: Routes = [
  // Rota de Login (Protegida pelo GuestGuard: Logados não entram aqui)
  { 
    path: 'auth/login',
    component: Login,
    canActivate: [guestGuard]
  },

  // dashboard routes
  { path: 'admin', component: AdminDashboard },
  { path: 'supervisor', component: SupervisorDashboard },
  { path: 'user', component: UserDashboard },

  // root redirect
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
  { path: '**', redirectTo: 'auth/login' }
];