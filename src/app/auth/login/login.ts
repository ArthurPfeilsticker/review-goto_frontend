import { Component, ChangeDetectorRef } from '@angular/core'; // 1. Importe ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // 2. Injete o detector aqui
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.authService.redirectUser();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;

        // Define a mensagem baseada no erro
        if (err.status === 401) {
          this.errorMessage = 'E-mail ou senha incorretos.';
        } else {
          this.errorMessage = 'Erro de conexão. Tente novamente.';
        }

        // 3. O FIX MÁGICO: Força o Angular a mostrar o erro AGORA
        this.cdr.detectChanges();
      }
    });
  }
}