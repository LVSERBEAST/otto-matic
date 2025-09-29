import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  /**
   * Custom email validator with improved regex
   */
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value) ? null : { email: true };
    };
  }

  /**
   * Phone number validator (supports various formats)
   */
  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Check if it's a valid length (10-11 digits for US numbers)
      if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        return { phone: true };
      }
      
      return null;
    };
  }

  /**
   * URL validator
   */
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      try {
        new URL(value);
        return null;
      } catch {
        // Try with http:// prefix
        try {
          new URL(`http://${value}`);
          return null;
        } catch {
          return { url: true };
        }
      }
    };
  }

  /**
   * Positive number validator
   */
  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value == null || value === '') return null;
      
      const numValue = Number(value);
      return numValue > 0 ? null : { positiveNumber: true };
    };
  }

  /**
   * Non-negative number validator (allows zero)
   */
  static nonNegativeNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value == null || value === '') return null;
      
      const numValue = Number(value);
      return numValue >= 0 ? null : { nonNegativeNumber: true };
    };
  }

  /**
   * Percentage validator (0-100)
   */
  static percentage(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value == null || value === '') return null;
      
      const numValue = Number(value);
      return (numValue >= 0 && numValue <= 100) ? null : { percentage: true };
    };
  }

  /**
   * ZIP code validator (US format)
   */
  static zipCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const zipRegex = /^\d{5}(-\d{4})?$/;
      return zipRegex.test(value) ? null : { zipCode: true };
    };
  }

  /**
   * Custom matcher for password confirmation
   */
  static matchField(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control.parent;
      if (!group) return null;
      
      const field = group.get(fieldName);
      if (!field) return null;
      
      return control.value === field.value ? null : { matchField: true };
    };
  }

  /**
   * Get user-friendly error message for validation errors
   */
  static getErrorMessage(errors: ValidationErrors, fieldName: string = 'Field'): string {
    const errorKey = Object.keys(errors)[0];
    
    const errorMessages: Record<string, string> = {
      required: `${fieldName} is required`,
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      url: 'Please enter a valid URL',
      positiveNumber: `${fieldName} must be a positive number`,
      nonNegativeNumber: `${fieldName} cannot be negative`,
      percentage: `${fieldName} must be between 0 and 100`,
      zipCode: 'Please enter a valid ZIP code',
      matchField: 'Fields do not match',
      minlength: `${fieldName} must be at least ${errors['minlength']?.requiredLength} characters`,
      maxlength: `${fieldName} cannot exceed ${errors['maxlength']?.requiredLength} characters`,
    };
    
    return errorMessages[errorKey] || `${fieldName} is invalid`;
  }
}
