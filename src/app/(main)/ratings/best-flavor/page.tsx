export const dynamic = 'force-dynamic'

export default async function BestFlavorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-clash-display text-4xl font-medium tracking-tight text-primary">Best Flavored Sparkling Waters</h1>
        <p className="mt-2 font-plus-jakarta text-lg leading-8 text-primary/80">
          The most delicious and authentic flavored sparkling waters, rated by taste and aroma.
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center bg-card rounded-lg border shadow-sm">
        <p className="text-lg text-muted-foreground">
          Our flavor ratings are coming soon! We're gathering community feedback to create comprehensive rankings.
        </p>
        <p className="text-sm text-muted-foreground">
          In the meantime, you can explore our product directory and start rating your favorite flavored sparkling waters.
        </p>
      </div>
    </div>
  )
} 