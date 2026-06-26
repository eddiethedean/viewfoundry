import type { ComponentDefinition, PropSchema } from '@viewfoundry/core';
import { createDefaultProps } from './validation.js';

export type DefineComponentOptions<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: string;
  label?: string;
  description?: string;
  category?: string;
  props?: PropSchema<TProps>;
  defaultProps?: Partial<TProps>;
  acceptsChildren?: boolean;
  allowedChildren?: string[];
};

export function defineComponent<TProps extends Record<string, unknown> = Record<string, unknown>>(
  component: unknown,
  options: DefineComponentOptions<TProps>,
): ComponentDefinition<TProps> {
  const schemaDefaults = options.props ? createDefaultProps(options.props) : {};
  return {
    ...options,
    component,
    defaultProps: { ...schemaDefaults, ...options.defaultProps } as Partial<TProps>,
  };
}
