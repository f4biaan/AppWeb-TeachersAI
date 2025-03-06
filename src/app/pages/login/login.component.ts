import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export default class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((user) => {
      if (user) {
        console.log('User is logged in');
        this.router.navigate(['/dashboard']);
      }
    });

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService
        .loginUserAndPassword(username, password)
        .then(() => {
          this.router.navigate(['/dashboard']);
        })
        .catch((err) => this.handleLoginError(err));
    }
  }

  private handleLoginError(err: any) {
    console.log(err.message);
    let message = '';

    switch (err.message) {
      case 'Firebase: The email address is badly formatted. (auth/invalid-email).':
        message = 'El correo electrónico es incorrecto';
        break;
      case 'Firebase: The supplied auth credential is incorrect, malformed or has expired. (auth/invalid-credential).':
        message = 'La contraseña es incorrecta';
        break;
      default:
        message = 'Error desconocido, intente de nuevo';
    }

    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
    });
  }
}
