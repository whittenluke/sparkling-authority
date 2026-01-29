'use client'

type Scope = 'products' | 'brands'

interface ScopeSelectorProps {
  scope: Scope
  onScopeChange: (scope: Scope) => void
}

export function ScopeSelector({ scope, onScopeChange }: ScopeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-1" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={scope === 'products'}
        onClick={() => onScopeChange('products')}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${scope === 'products'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        Products
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={scope === 'brands'}
        onClick={() => onScopeChange('brands')}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${scope === 'brands'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        Brands
      </button>
    </div>
  )
}
