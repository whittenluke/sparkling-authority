'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SubmitProductForm() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [brandName, setBrandName] = useState('')
  const [newBrandName, setNewBrandName] = useState('')
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [flavors, setFlavors] = useState<string[]>([])
  const [flavorInput, setFlavorInput] = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/community/products/submit')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleAddFlavor = () => {
    if (flavorInput.trim() && !flavors.includes(flavorInput.trim())) {
      setFlavors([...flavors, flavorInput.trim()])
      setFlavorInput('')
    }
  }

  const handleRemoveFlavor = (flavor: string) => {
    setFlavors(flavors.filter(f => f !== flavor))
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm dark:shadow-none opacity-75">
      <form className="p-6 space-y-6">
        {/* Brand Selection/Input */}
        <div>
          <label htmlFor="brand-search" className="text-sm font-medium text-foreground">
            Brand
          </label>
          <div className="mt-1.5">
            <input
              type="text"
              id="brand-search"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Search for an existing brand..."
              className="w-full px-3 py-2 bg-background text-foreground border rounded-md 
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                       focus:ring-primary/20 dark:focus:ring-primary/30"
              disabled
            />
            {brandName === 'other' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter new brand name..."
                  className="w-full px-3 py-2 bg-background text-foreground border rounded-md 
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                           focus:ring-primary/20 dark:focus:ring-primary/30"
                  disabled
                />
              </div>
            )}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label htmlFor="product-name" className="text-sm font-medium text-foreground">
            Product Name
          </label>
          <div className="mt-1.5">
            <input
              type="text"
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter the product name..."
              className="w-full px-3 py-2 bg-background text-foreground border rounded-md 
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                       focus:ring-primary/20 dark:focus:ring-primary/30"
              disabled
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <div className="mt-1.5">
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product..."
              className="w-full px-3 py-2 bg-background text-foreground border rounded-md 
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                       focus:ring-primary/20 dark:focus:ring-primary/30 resize-none"
              disabled
            />
          </div>
        </div>

        {/* Flavors */}
        <div>
          <label className="text-sm font-medium text-foreground">Flavors</label>
          <div className="mt-1.5 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={flavorInput}
                onChange={(e) => setFlavorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFlavor())}
                placeholder="Add a flavor..."
                className="flex-1 px-3 py-2 bg-background text-foreground border rounded-md 
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                         focus:ring-primary/20 dark:focus:ring-primary/30"
                disabled
              />
              <button
                type="button"
                onClick={handleAddFlavor}
                className="px-4 py-2 text-sm font-medium rounded-md 
                         bg-primary text-primary-foreground hover:bg-primary/90"
                disabled
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {flavors.map((flavor) => (
                <span
                  key={flavor}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full 
                           bg-accent text-accent-foreground text-sm"
                >
                  {flavor}
                  <button
                    type="button"
                    onClick={() => handleRemoveFlavor(flavor)}
                    className="hover:text-destructive"
                    disabled
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled
            className="px-4 py-2 text-sm font-medium rounded-md 
                     bg-primary text-primary-foreground
                     opacity-50 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </form>
    </div>
  )
} 