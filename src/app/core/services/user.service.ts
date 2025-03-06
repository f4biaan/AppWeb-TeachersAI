import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  Observable,
  Subject,
  throwError,
} from 'rxjs';

import { User } from '../interfaces/user';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _user$: BehaviorSubject<User> = new BehaviorSubject(
    {} as User
  );
  private readonly _userHome$: Subject<User> = new Subject();

  private readonly baseUrl = 'http://localhost:8080/user';

  constructor(private readonly _httpClient: HttpClient) {}

  setUser(user: User) {
    this._user$.next(user);
    this._userHome$.next(user);
  }

  get user$() {
    return this._user$.asObservable();
  }

  get userHome$() {
    return this._userHome$.asObservable();
  }

  /**
   * @function getUserById
   * @description This function is used to get a user by its ID from the API
   * @param id is the id of the current user
   * @returns an Observable of type User with the user object from the API
   */
  getUserById(id: string): Observable<User> {
    return this._httpClient.get<User>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.status === 404) {
          errorMessage =
            error.error?.message ||
            'No se encontró el usuario con el ID proporcionado';
        } else if (error.status === 500) {
          errorMessage =
            error.error?.message ||
            'Ocurrió un error inesperado en el servidor';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'La solicitud no es válida';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * @function getCurrentUser
   * @description This function is used to get the current user
   * @returns the current user data
   */
  getCurrentUser() {
    return this._user$.getValue();
  }
}
