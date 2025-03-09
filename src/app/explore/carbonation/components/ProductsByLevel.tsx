import Link from 'next/link'

type Product = {
  id: string
  name: string
  carbonation_level: number
  brands: {
    id: string
    name: string
  }
}

type ProductsByLevelProps = {
  productsByLevel: {
    [key: number]: Product[]
  }
}

export function ProductsByLevel({ productsByLevel }: ProductsByLevelProps) {
  return (
    <div className="space-y-8">
      {Object.entries(productsByLevel)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([level, products]) => (
          <div key={level} className="rounded-xl bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                style={{
                  background: `hsl(200, ${Math.min(30 + Number(level) * 7, 100)}%, ${Math.max(85 - Number(level) * 4, 45)}%)`,
                  color: Number(level) > 5 ? 'white' : 'inherit'
                }}
              >
                {level}
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Level {level} Products
              </h3>
            </div>

            <div className="space-y-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/explore/products/${product.id}`}
                  className="block rounded-lg bg-muted p-3 hover:bg-accent transition-colors"
                >
                  <span className="font-medium text-foreground">{product.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">by {product.brands.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
} 