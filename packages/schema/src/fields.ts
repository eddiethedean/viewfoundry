import type { PropField } from '@viewfoundry/core';

export type TextFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
  hidden?: boolean;
  pattern?: string;
};

export type TextareaFieldOptions = TextFieldOptions;

export type NumberFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: number;
  required?: boolean;
  hidden?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

export type BooleanFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: boolean;
  required?: boolean;
  hidden?: boolean;
};

export type SelectOption = string | { label: string; value: string };

export type SelectFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
  hidden?: boolean;
  options: SelectOption[];
};

export type RadioFieldOptions = SelectFieldOptions;

export type ColorFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
  hidden?: boolean;
};

export type ImageFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
  hidden?: boolean;
};

export type UrlFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
  hidden?: boolean;
  pattern?: string;
};

export type JsonFieldOptions = {
  label?: string;
  description?: string;
  defaultValue?: unknown;
  required?: boolean;
  hidden?: boolean;
};

export function text(options: TextFieldOptions = {}): PropField<string> {
  return { kind: 'text', ...options };
}

export function textarea(options: TextareaFieldOptions = {}): PropField<string> {
  return { kind: 'textarea', ...options };
}

export function number(options: NumberFieldOptions = {}): PropField<number> {
  return { kind: 'number', ...options };
}

export function boolean(options: BooleanFieldOptions = {}): PropField<boolean> {
  return { kind: 'boolean', ...options };
}

export function select(options: SelectFieldOptions): PropField<string> {
  return { kind: 'select', ...options };
}

export function radio(options: RadioFieldOptions): PropField<string> {
  return { kind: 'radio', ...options };
}

export function color(options: ColorFieldOptions = {}): PropField<string> {
  return { kind: 'color', ...options };
}

export function image(options: ImageFieldOptions = {}): PropField<string> {
  return { kind: 'image', ...options };
}

export function url(options: UrlFieldOptions = {}): PropField<string> {
  return { kind: 'url', ...options };
}

export function json(options: JsonFieldOptions = {}): PropField<unknown> {
  return { kind: 'json', ...options };
}

function normalizeSelectOptions(options: SelectOption[]): string[] {
  return options.map((opt) => (typeof opt === 'string' ? opt : opt.value));
}

export function getSelectValues(field: PropField<string>): string[] | undefined {
  if (field.kind !== 'select' && field.kind !== 'radio') return undefined;
  const options = field.options as SelectOption[] | undefined;
  return options ? normalizeSelectOptions(options) : undefined;
}
