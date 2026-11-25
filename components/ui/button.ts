import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold',
  {
    variants: {
      variant: { default: '' },
      size: { default: 'min-h-12' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)
