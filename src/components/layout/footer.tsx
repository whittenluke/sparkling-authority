import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <span className="text-lg font-bold text-blue-600">SparklingAuthority</span>
            <p className="text-sm text-gray-600">
              Your trusted guide to the world of sparkling water.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Explore</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/brands" className="text-sm text-gray-600 hover:text-blue-600">
                      Brands
                    </Link>
                  </li>
                  <li>
                    <Link href="/reviews" className="text-sm text-gray-600 hover:text-blue-600">
                      Reviews
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-sm text-gray-600 hover:text-blue-600">
                      Guides
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} SparklingAuthority. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 