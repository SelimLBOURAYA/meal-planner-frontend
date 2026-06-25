import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface RefreshResponse {
  accessToken: string;
}

const ACCESS_TOKEN_KEY = 'meal-planner-access-token';
const REFRESH_TOKEN_KEY = 'meal-planner-refresh-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthUser | null>(null);
  private _accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);
  private _refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  getAccessToken(): string | null {
    return this._accessToken;
  }

  getRefreshToken(): string | null {
    return this._refreshToken;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.storeAuth(response)));
  }

  register(displayName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, { displayName, email, password })
      .pipe(tap((response) => this.storeAuth(response)));
  }

  loadCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiBaseUrl}/auth/me`).pipe(
      tap((user) => this._currentUser.set(user)),
      catchError((err) => {
        this.clearAuth();
        return throwError(() => err);
      }),
    );
  }

  refresh(): Observable<RefreshResponse> {
    const refreshToken = this._refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.http
      .post<RefreshResponse>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          this._accessToken = response.accessToken;
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        }),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  logout(): void {
    this.clearAuth();
    void this.router.navigate(['/login']);
  }

  private storeAuth(response: AuthResponse): void {
    this._accessToken = response.accessToken;
    this._refreshToken = response.refreshToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    this._currentUser.set(response.user);
  }

  private clearAuth(): void {
    this._accessToken = null;
    this._refreshToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._currentUser.set(null);
  }
}
