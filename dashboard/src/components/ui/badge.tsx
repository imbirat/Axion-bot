import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)]/10 text-[var(--primary)]',
        success: 'bg-[var(--success)]/15 text-[var(--success)]',
        warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
        danger: 'bg-[var(--danger)]/15 text-[var(--danger)]',
        outline: 'border border-[var(--border)] text-[var(--muted)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
