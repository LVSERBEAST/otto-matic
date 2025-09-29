import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ValidatorsService } from '../../utils/validators.service';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class BaseFormComponent<T> {
  protected readonly fb = inject(FormBuilder);
  protected readonly validatorsService = inject(ValidatorsService);
  readonly submitted = output<T>();

  abstract form: FormGroup;
  abstract resetForm(): void;

  protected handleSubmit(): void {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.form.getRawValue() as T;
    this.submitted.emit(formValue);
    this.resetForm();
  }

  onSubmit(): void {
    this.handleSubmit();
  }

  protected markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }
  
  protected getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (control?.errors && control.touched) {
      return ValidatorsService.getErrorMessage(control.errors, this.getFieldDisplayName(fieldName));
    }
    return null;
  }
  
  protected getFieldDisplayName(fieldName: string): string {
    // Convert camelCase to Title Case
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}
