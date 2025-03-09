import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <span className="text-lg font-bold text-primary">SparklingAuthority</span>
            <p className="text-sm text-muted-foreground">
              Your trusted guide to the world of sparkling water.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Explore</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/brands" className="text-sm text-muted-foreground hover:text-foreground">
                      Brands
                    </Link>
                  </li>
                  <li>
                    <Link href="/reviews" className="text-sm text-muted-foreground hover:text-foreground">
                      Reviews
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-sm text-muted-foreground hover:text-foreground">
                      Guides
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SparklingAuthority. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 