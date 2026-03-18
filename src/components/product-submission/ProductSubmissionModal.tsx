'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth-context'
import { createClientComponentClient } from '@/lib/supabase/client'

interface ProductSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProductSubmissionModal({ isOpen, onClose }: ProductSubmissionModalProps) {
  const { user } = useAuth()
  const [brandName, setBrandName] = useState('')
  const [productName, setProductName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const b = brandName.trim()
    const p = productName.trim()
    if (!b || !p) {
      setError('Brand and flavor/product name are required.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      if (user) {
        // Logged-in: insert from client (same as reviews in-page form); RLS allows authenticated.
        const supabase = createClientComponentClient()
        const { error: insertError } = await supabase
          .from('product_submissions')
          .insert({
            brand_name: b,
            product_name: p,
            image_url: imageUrl.trim() || null,
            notes: notes.trim() || null,
            status: 'pending',
          })
          .select('id')
          .single()
        if (insertError) throw insertError
      } else {
        // Guest: POST to API so insert runs as anon (same as guest reviews).
        const res = await fetch('/api/product-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand_name: b,
            product_name: p,
            image_url: imageUrl.trim() || undefined,
            notes: notes.trim() || undefined,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error ?? 'Something went wrong. Please try again.')
          return
        }
      }
      setBrandName('')
      setProductName('')
      setImageUrl('')
      setNotes('')
      setSuccess(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSuccess(false)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-card text-card-foreground rounded-lg shadow-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add a flavor</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <p className="text-muted-foreground">
            Thanks, we&apos;ll review and add it soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="ps-brand" className="block text-sm font-medium mb-1">
                Brand <span className="text-destructive">*</span>
              </label>
              <input
                id="ps-brand"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. LaCroix"
                required
              />
            </div>
            <div>
              <label htmlFor="ps-product" className="block text-sm font-medium mb-1">
                Flavor / Product name <span className="text-destructive">*</span>
              </label>
              <input
                id="ps-product"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. Pomegranate"
                required
              />
            </div>
            <div>
              <label htmlFor="ps-image" className="block text-sm font-medium mb-1">
                Image URL <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="ps-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label htmlFor="ps-notes" className="block text-sm font-medium mb-1">
                Notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="ps-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                placeholder="Any extra details..."
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
