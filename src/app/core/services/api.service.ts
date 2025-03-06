import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _httpClient: HttpClient) {}

  testConexionAPI(): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this._httpClient.get('http://localhost:8080/ai/simple', { headers });
  }
}
