'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import { generateSlug, ensureUniqueSlug } from '@/lib/utils' // Import generateSlug and ensureUniqueSlug
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Building2,
  Eye,
  EyeOff,
  Check,
  X,
  X as CloseIcon,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  country_of_origin: string | null
  founded_year: number | null
  is_active: boolean
  created_at: string
  products_count?: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  brands: {
    id: string
    name: string
    slug: string
  }[]
  flavor_categories: string[] | null
  flavor_tags: string[] | null
  carbonation_level: number
  is_discontinued: boolean
  created_at: string
}

type TabType = 'brands' | 'products'

export default function AdminBrandsProducts() {
  const [activeTab, setActiveTab] = useState<TabType>('brands')
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  // Form state for adding/editing brands
  const [brandName, setBrandName] = useState('')
  const [brandSlug, setBrandSlug] = useState('') // Renamed to avoid conflict with `slug` in Product interface
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [foundedYear, setFoundedYear] = useState<number | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({})

  // Auto-generate slug when brand name changes, but allow manual override
  useEffect(() => {
    if (brandName && !editingBrand) { // Only auto-generate for new brands
      setBrandSlug(generateSlug(brandName))
    } else if (editingBrand && brandName === editingBrand.name) {
      // If editing an existing brand and the name is unchanged, keep its original slug
      setBrandSlug(editingBrand.slug)
    }
  }, [brandName, editingBrand])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!brandName.trim()) errors.brandName = 'Brand Name is required.'
    if (!brandSlug.trim()) errors.brandSlug = 'Slug is required.'
    if (!description.trim()) errors.description = 'Description is required.'
    if (!countryOfOrigin.trim()) errors.countryOfOrigin = 'Country of Origin is required.'
    if (!foundedYear || isNaN(Number(foundedYear)) || Number(foundedYear) < 1800 || Number(foundedYear) > new Date().getFullYear() + 5) {
      errors.foundedYear = 'Valid Founded Year is required (e.g., 1800-2026).'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const supabase = createClientComponentClient()

  // Load brands with product counts
  const loadBrands = useCallback(async () => {
    try {
      setError(null)

      // Get brands with product counts
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      if (brandsError) {
        console.error('Error loading brands:', brandsError)
        setError('Failed to load brands')
        return
      }

      if (!brandsData) {
        setBrands([])
        return
      }

      // Get product counts for each brand
      const brandIds = brandsData.map(brand => brand.id)
      const { data: productCounts, error: countsError } = await supabase
        .from('products')
        .select('brand_id')
        .in('brand_id', brandIds)

      if (countsError) {
        console.error('Error loading product counts:', countsError)
      }

      // Count products per brand
      const countsMap = (productCounts || []).reduce((acc, product) => {
        acc[product.brand_id] = (acc[product.brand_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Combine brand data with counts
      const brandsWithCounts = brandsData.map(brand => ({
        ...brand,
        products_count: countsMap[brand.id] || 0
      }))

      // Apply search filter
      const filteredBrands = searchTerm
        ? brandsWithCounts.filter(brand =>
            brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : brandsWithCounts

      setBrands(filteredBrands)
    } catch (err) {
      console.error('Unexpected error loading brands:', err)
      setError('An unexpected error occurred')
    }
  }, [supabase, searchTerm])

  // Load products with brand info
  const loadProducts = useCallback(async () => {
    try {
      setError(null)

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          flavor_categories,
          flavor_tags,
          carbonation_level,
          is_discontinued,
          created_at,
          brands (
            id,
            name,
            slug
          )
        `)
        .order('name')

      if (productsError) {
        console.error('Error loading products:', productsError)
        setError('Failed to load products')
        return
      }

      // Apply search filter
      const filteredProducts = searchTerm
        ? (productsData || []).filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brands?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : (productsData || [])

      setProducts(filteredProducts)
    } catch (err) {
      console.error('Unexpected error loading products:', err)
      setError('An unexpected error occurred')
    }
  }, [supabase, searchTerm])

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    setValidationErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const uniqueSlug = await ensureUniqueSlug(brandSlug, 'brands')

      const { error: insertError } = await supabase
        .from('brands')
        .insert({
          name: brandName.trim(),
          slug: uniqueSlug,
          description: description.trim(),
          website: website.trim() || null,
          country_of_origin: countryOfOrigin.trim(),
          founded_year: Number(foundedYear),
          is_active: true, // Default to active for new brands
        })
        .select()
        .single()

      if (insertError) {
        // Check for unique constraint violations - handle different error formats
        const errorMessage = insertError.message || insertError.details || ''
        const errorCode = insertError.code || insertError.hint?.match(/\((\d+)\)/)?.[1]
        
        if (errorCode === '23505' || errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
          if (errorMessage.includes('brands_name_key') || errorMessage.includes('name')) {
            setFormError('A brand with this name already exists.')
          } else if (errorMessage.includes('brands_slug_key') || errorMessage.includes('slug')) {
            setFormError('A brand with this slug already exists. Please try a different name or manually adjust the slug.')
          } else {
            setFormError('A brand with this information already exists. Please check your input.')
          }
        } else {
          setFormError('Failed to create brand. Please try again.')
        }
        return
      }

      setSuccessMessage('Brand created successfully!')
      setBrandName('')
      setBrandSlug('')
      setDescription('')
      setWebsite('')
      setCountryOfOrigin('')
      setFoundedYear('')
      await loadBrands() // Refresh the brands list
      setTimeout(() => setShowBrandModal(false), 1500) // Close modal after success message
    } catch (err) {
      console.error('Unexpected error creating brand:', err)
      setFormError('An unexpected error occurred while creating the brand.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      if (activeTab === 'brands') {
        await loadBrands()
      } else {
        await loadProducts()
      }
      setLoading(false)
    }

    loadData()
  }, [activeTab, loadBrands, loadProducts])

  const tabs = [
    { id: 'brands' as TabType, label: 'Brands', icon: Building2, count: brands.length },
    { id: 'products' as TabType, label: 'Products', icon: Package, count: products.length }
  ]

  if (loading && brands.length === 0 && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand & Product Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage brands and products in your sparkling water database
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'brands') {
                setEditingBrand(null)
                setBrandName('')
                setBrandSlug('')
                setDescription('')
                setWebsite('')
                setCountryOfOrigin('')
                setFoundedYear('')
                setFormError(null)
                setSuccessMessage(null)
                setIsSubmitting(false)
                setShowBrandModal(true)
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === 'brands' ? 'Brand' : 'Product'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Founded
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{brand.name}</div>
                        <div className="text-sm text-muted-foreground">{brand.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {brand.country_of_origin || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {brand.founded_year || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {brand.products_count}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        brand.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {brand.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-muted-foreground hover:text-foreground p-1"
                          title="Edit brand"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-red-600 p-1"
                          title="Delete brand"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {brand.website && (
                          <Link
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground p-1"
                            title="Visit website"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {brands.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No brands found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first brand.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Flavors
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Carbonation
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/explore/brands/${product.brands[0]?.slug}`}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        {product.brands[0]?.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.flavor_categories?.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                        {product.flavor_categories && product.flavor_categories.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{product.flavor_categories.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      Level {product.carbonation_level}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        !product.is_discontinued
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {!product.is_discontinued ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        {!product.is_discontinued ? 'Available' : 'Discontinued'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-muted-foreground hover:text-foreground p-1"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-red-600 p-1"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/explore/products/${product.slug}`}
                          className="text-muted-foreground hover:text-foreground p-1"
                          title="View product"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {activeTab === 'brands' ? brands.length : products.length} {activeTab}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <button
                onClick={() => setShowBrandModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateBrand}>
              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-foreground mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  id="brandName"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Enter brand name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                />
                {validationErrors.brandName && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.brandName}</p>
                )}
              </div>

              <div>
                <label htmlFor="brandSlug" className="block text-sm font-medium text-foreground mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  id="brandSlug"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="auto-generated-slug"
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from name, editable
                </p>
                {validationErrors.brandSlug && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.brandSlug}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  rows={3}
                  placeholder="Brief description of the brand"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
                )}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="countryOfOrigin" className="block text-sm font-medium text-foreground mb-1">
                    Country of Origin *
                  </label>
                  <input
                    type="text"
                    id="countryOfOrigin"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="United States"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    required
                  />
                  {validationErrors.countryOfOrigin && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.countryOfOrigin}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="foundedYear" className="block text-sm font-medium text-foreground mb-1">
                    Founded Year *
                  </label>
                  <input
                    type="number"
                    id="foundedYear"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="2020"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    required
                  />
                  {validationErrors.foundedYear && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.foundedYear}</p>
                  )}
                </div>
              </div>

              {/* Active checkbox removed as per instructions */}

              {formError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  {successMessage}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : (editingBrand ? 'Update Brand' : 'Create Brand')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
