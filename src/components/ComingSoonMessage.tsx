import Link from 'next/link'

interface ComingSoonMessageProps {
  title: string
  description: string
}

export function ComingSoonMessage({ title, description }: ComingSoonMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center bg-card rounded-lg border shadow-sm">
      <p className="text-lg text-muted-foreground">
        {title}
      </p>
      <p className="text-sm text-muted-foreground">
        In the meantime, you can explore our{' '}
        <Link href="/explore/brands" className="text-primary hover:text-primary/80">
          brands
        </Link>
        {' '}or{' '}
        <Link href="/explore/products" className="text-primary hover:text-primary/80">
          product directory
        </Link>
        {' '}and {description}
      </p>
    </div>
  )
} 