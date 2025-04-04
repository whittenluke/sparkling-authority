export const dynamic = 'force-dynamic'

export default async function NewReleasesPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">New Releases</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The latest additions to the sparkling water world.
        </p>
      </div>

      {/* New Products Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">New Products</h2>
        <div className="mt-4 rounded-xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
          <p className="text-muted-foreground">
            New product releases will be shown here soon.
          </p>
        </div>
      </div>

      {/* New Brands Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">New Brands</h2>
        <div className="mt-4 rounded-xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
          <p className="text-muted-foreground">
            New brand launches will be shown here soon.
          </p>
        </div>
      </div>
    </div>
  )
} 