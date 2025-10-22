import type { ComponentPropsWithoutRef } from 'react';

export type LabelProps = ComponentPropsWithoutRef<'label'>;

export const Label = ({ children, ...props }: LabelProps) => {
  return <label {...props}>{children}</label>;
};
