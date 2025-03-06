import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import 'firebase/compat/auth';
import { Observable, of, switchMap } from 'rxjs';
import { User } from '../interfaces/user';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = 'http://localhost:8080/user';

  constructor(
    private readonly afAuth: AngularFireAuth,
    private readonly _httpCliente: HttpClient,
    private readonly router: Router
  ) {}

  /**
   * @function registerUserWithEmailAndPassword
   * @description This function is used to register a new user with email and password
   * @param email is the email of the user
   * @param password is the password of the user
   * @returns a promise with the user data if the login is successful
   */
  async loginUserAndPassword(email: string, password: string) {
    try {
      return await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  }

  isLoggedIn() {
    return this.afAuth.authState;
  }

  getCurrentUser(): Observable<User | null> {
    return this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this._httpCliente.get<User>(`${this.baseUrl}/${user.uid}`);
        } else {
          return of(null);
        }
      })
    );
  }

  async logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
    await this.afAuth.signOut();
  }
}
