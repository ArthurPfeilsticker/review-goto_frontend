import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. Clona a requisição para adicionar o token (se existir)
  const token = localStorage.getItem('access_token');
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Passa a requisição adiante e vigia a resposta
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // O PULO DO GATO: Se o erro for 401 (Token Expirado ou Inválido)
      if (error.status === 401) {
        console.warn('Sessão expirada. Redirecionando para login...');
        
        // Limpa o lixo local
        localStorage.clear(); // Ou remova itens específicos

        // Manda para o login
        router.navigate(['/login']);
      }

      // Repassa o erro caso o componente queira tratar algo específico
      return throwError(() => error);
    })
  );
};