import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ApiError {
  code?: string;
  message: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  handleApiError(error: any, context: string): string {
    console.error(`[${context}] API Error:`, error);
    
    // Firebase errors
    if (error?.code) {
      return this.formatFirebaseError(error);
    }
    
    // HTTP errors
    if (error?.status) {
      return this.formatHttpError(error);
    }
    
    // Generic error
    return error?.message || 'An unexpected error occurred. Please try again.';
  }

  private formatFirebaseError(error: any): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Invalid password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.',
      'firestore/permission-denied': 'You do not have permission to perform this action.',
      'firestore/unavailable': 'Service temporarily unavailable. Please try again.',
    };

    return errorMessages[error.code] || `Error: ${error.code}`;
  }

  private formatHttpError(error: any): string {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${error.status}`;
    }
  }

  handleErrorSafely<T>(fallbackValue: T) {
    return (error: any): Observable<T> => {
      console.error('Handled error:', error);
      return of(fallbackValue);
    };
  }
}
