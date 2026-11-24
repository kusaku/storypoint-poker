import type { ComponentPropsWithoutRef } from 'react'
import { Icon } from '@/app/components/Icon'

type SelectControlProps = Omit<ComponentPropsWithoutRef<'select'>, 'className'> & {
  displayValue?: string
}

export function SelectControl({ children, displayValue, ...props }: SelectControlProps) {
  return (
    <span className="select-control">
      <select {...props} className="input">{children}</select>
      {displayValue !== undefined && (
        <span className="input select-value" aria-hidden="true">{displayValue}</span>
      )}
      <Icon name="chevron" size={18} />
    </span>
  )
}
