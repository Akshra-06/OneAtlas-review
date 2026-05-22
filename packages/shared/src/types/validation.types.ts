// Shared validation types used across packages

export interface ValidationResult {
  isValid: boolean;
  errors: CodeValidationError[];
  warnings: ValidationWarning[];
}

export interface CodeValidationError {
  type: 'syntax' | 'structure' | 'import' | 'export' | 'type';
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'style' | 'performance' | 'best-practice';
  message: string;
  line?: number;
}
