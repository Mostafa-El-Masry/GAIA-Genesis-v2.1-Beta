'use client';

import React from 'react';
import { useDesign } from '../context/DesignProvider';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

export default function Button({ className = '', children, ...rest }: Props) {
  const { button, theme } = useDesign();

  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition focus:outline-none gaia-focus';
  let style = '';

  if (button === 'solid') {
    style = 'gaia-contrast';
  } else if (button === 'outline') {
    style = 'border gaia-border gaia-hover-soft';
  } else { // ghost
    style = 'gaia-hover-soft';
  }

  return (
    <button className={`${base} ${style} ${className}`} {...rest}>
      {children}
    </button>
  );
}
