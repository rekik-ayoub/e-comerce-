import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = typeof window !== 'undefined' && window.location.port === '4200' 
    ? 'http://localhost:8000/api' 
    : '/api';
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('bayou_token');
    const savedUser = localStorage.getItem('bayou_user');
    if (savedToken && savedUser) {
      try {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
        this.refreshUser().subscribe();
      } catch (e) {
        this.clearSession();
      }
    }
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  logout(): Observable<any> {
    this.clearSession();
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null))
    );
  }

  refreshUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        if (res.user) {
          this.currentUser.set(res.user);
          localStorage.setItem('bayou_user', JSON.stringify(res.user));
        }
      })
    );
  }

  updatePoints(points: number) {
    const user = this.currentUser();
    if (user) {
      const updated = { ...user, points };
      this.currentUser.set(updated);
      localStorage.setItem('bayou_user', JSON.stringify(updated));
    }
  }

  private handleAuthResponse(res: any) {
    if (res.token && res.user) {
      this.token.set(res.token);
      this.currentUser.set(res.user);
      localStorage.setItem('bayou_token', res.token);
      localStorage.setItem('bayou_user', JSON.stringify(res.user));
    }
  }

  clearSession() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('bayou_token');
    localStorage.removeItem('bayou_user');
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }
}
