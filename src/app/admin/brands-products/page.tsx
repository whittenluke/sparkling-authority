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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { PartialStar } from '@/components/ui/PartialStar'
import { getStarFillPercentages } from '@/lib/star-utils'
import { calculateMeanRating, calculateProductRatings } from '@/lib/product-utils'
import { parseReviewFullSections, joinReviewFullSections } from '@/lib/review-full-utils'

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
  verdict: string | null
  review_full?: string | null
  brand_id?: string
  brands: {
    id: string
    name: string
    slug: string
  } | {
    id: string
    name: string
    slug: string
  }[] | null
  flavor_categories: string[] | null
  flavor_tags: string[] | null
  carbonation_level: number
  is_discontinued: boolean
  review_status?: string | null
  created_at: string
  reviews?: Array<{ overall_rating: number }>
  trueAverage?: number
  ratingCount: number
}

function getProductBrand(product: Product): { id: string; name: string; slug: string } | null {
  const brands = product.brands
  if (!brands) return null
  if (Array.isArray(brands)) return brands[0] ?? null
  return brands
}

type TabType = 'brands' | 'products'

type NutritionInfo = {
  serving_size?: string
  calories?: number
  total_fat?: number
  sodium?: number
  total_carbohydrates?: number
  total_sugars?: number
  protein?: number
  ingredients?: string
}

type ProductInsertPayload = {
  brand_id: string
  name: string
  slug: string
  verdict: string | null
  flavor_categories: string[] | null
  flavor_tags: string[] | null
  carbonation_level: number
  nutrition_info: NutritionInfo | null
  amazon_link: string | null
  walmart_link: string | null
  instacart_link: string | null
  product_website_link: string | null
  is_discontinued: boolean
  product_line_id?: string | null
}

function ProductAddDropdown({ onSelectSingle, onSelectBulk }: { onSelectSingle: () => void; onSelectBulk: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Product
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  onSelectSingle()
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                Add Single Product
              </button>
              <button
                onClick={() => {
                  onSelectBulk()
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                Add Bulk Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminBrandsProducts() {
  const [activeTab, setActiveTab] = useState<TabType>('brands')
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [showEditBrandModal, setShowEditBrandModal] = useState(false)
  const [editBrandName, setEditBrandName] = useState('')
  const [editBrandDescription, setEditBrandDescription] = useState('')
  const [editBrandWebsite, setEditBrandWebsite] = useState('')
  const [editBrandCountryOfOrigin, setEditBrandCountryOfOrigin] = useState('')
  const [editBrandFoundedYear, setEditBrandFoundedYear] = useState<number | ''>('')
  const [editBrandIsActive, setEditBrandIsActive] = useState(true)
  const [editBrandFormError, setEditBrandFormError] = useState<string | null>(null)
  const [editBrandSuccessMessage, setEditBrandSuccessMessage] = useState<string | null>(null)
  const [editBrandValidationErrors, setEditBrandValidationErrors] = useState<Record<string, string | undefined>>({})
  const [isSubmittingEditBrand, setIsSubmittingEditBrand] = useState(false)

  // Form state for adding brands only
  const [brandName, setBrandName] = useState('')
  const [brandSlug, setBrandSlug] = useState('') // Renamed to avoid conflict with `slug` in Product interface
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [foundedYear, setFoundedYear] = useState<number | ''>('')
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({})

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false)
  const [productModalType, setProductModalType] = useState<'single' | 'bulk'>('single')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [productName, setProductName] = useState('')
  const [productSlug, setProductSlug] = useState('')
  const [productLineId, setProductLineId] = useState<string | null>(null)
  const [productVerdict, setProductVerdict] = useState('')
  const [flavorCategories, setFlavorCategories] = useState<string[]>([])
  const [flavorTags, setFlavorTags] = useState<string[]>([])
  const [carbonationLevel, setCarbonationLevel] = useState<number | ''>('')
  const [servingSize, setServingSize] = useState('')
  const [calories, setCalories] = useState<number | ''>('')
  const [totalFat, setTotalFat] = useState<number | ''>('')
  const [sodium, setSodium] = useState<number | ''>('')
  const [totalCarbohydrates, setTotalCarbohydrates] = useState<number | ''>('')
  const [totalSugars, setTotalSugars] = useState<number | ''>('')
  const [protein, setProtein] = useState<number | ''>('')
  const [ingredients, setIngredients] = useState('')
  const [amazonLink, setAmazonLink] = useState('')
  const [walmartLink, setWalmartLink] = useState('')
  const [instacartLink, setInstacartLink] = useState('')
  const [productWebsiteLink, setProductWebsiteLink] = useState('')
  const [availableProductLines, setAvailableProductLines] = useState<Array<{ id: string; name: string }>>([])
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false)
  const [productFormError, setProductFormError] = useState<string | null>(null)
  const [productSuccessMessage, setProductSuccessMessage] = useState<string | null>(null)
  const [productValidationErrors, setProductValidationErrors] = useState<Record<string, string | undefined>>({})

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [editProductName, setEditProductName] = useState('')
  const [editProductBrandId, setEditProductBrandId] = useState('')
  const [editProductReviewStatus, setEditProductReviewStatus] = useState<string>('needs_review')
  const [editProductCarbonationLevel, setEditProductCarbonationLevel] = useState<number>(5)
  const [editProductIsDiscontinued, setEditProductIsDiscontinued] = useState(false)
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null)
  const [editValidationErrors, setEditValidationErrors] = useState<Record<string, string | undefined>>({})
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editProductVerdict, setEditProductVerdict] = useState('')
  const [editProductReviewTaste, setEditProductReviewTaste] = useState('')
  const [editProductReviewCarbonation, setEditProductReviewCarbonation] = useState('')
  const [editProductReviewValue, setEditProductReviewValue] = useState('')

  // Pagination state
  const [brandsCurrentPage, setBrandsCurrentPage] = useState(1)
  const [brandsTotalCount, setBrandsTotalCount] = useState(0)
  const [productsCurrentPage, setProductsCurrentPage] = useState(1)
  const [productsTotalCount, setProductsTotalCount] = useState(0)
  const [productsSortBy, setProductsSortBy] = useState<'product' | 'brand' | 'rating' | 'review_status'>('product')
  const [productsSortDir, setProductsSortDir] = useState<'asc' | 'desc'>('asc')
  const BRANDS_PER_PAGE = 20
  const PRODUCTS_PER_PAGE = 50

  // CSV bulk import state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<Array<Record<string, string>>>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)

  // Data for dropdowns
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [availableFlavorCategories, setAvailableFlavorCategories] = useState<string[]>([])
  const [availableFlavorTags, setAvailableFlavorTags] = useState<string[]>([])

  // Auto-generate slug when brand name changes, but allow manual override
  useEffect(() => {
    if (brandName && !editingBrand) { // Only auto-generate for new brands
      setBrandSlug(generateSlug(brandName))
    } else if (editingBrand && brandName === editingBrand.name) {
      // If editing an existing brand and the name is unchanged, keep its original slug
      setBrandSlug(editingBrand.slug)
    }
  }, [brandName, editingBrand])

  // Auto-generate slug when product name changes
  useEffect(() => {
    if (productName && !editingBrand) {
      setProductSlug(generateSlug(productName))
    }
  }, [productName, editingBrand])

  // Reset pagination when search term changes
  useEffect(() => {
    setBrandsCurrentPage(1)
    setProductsCurrentPage(1)
  }, [searchTerm])

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

  const validateEditBrandForm = () => {
    const errors: Record<string, string> = {}
    if (!editBrandName.trim()) errors.editBrandName = 'Brand Name is required.'
    if (editBrandWebsite.trim() && !isValidUrl(editBrandWebsite.trim())) errors.editBrandWebsite = 'Please enter a valid URL.'
    if (editBrandFoundedYear !== '' && (isNaN(Number(editBrandFoundedYear)) || Number(editBrandFoundedYear) < 1800 || Number(editBrandFoundedYear) > new Date().getFullYear() + 5)) {
      errors.editBrandFoundedYear = 'Founded Year must be between 1800 and ' + (new Date().getFullYear() + 5) + ', or leave empty.'
    }
    setEditBrandValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateProductForm = () => {
    const errors: Record<string, string> = {}
    if (!selectedBrandId) errors.selectedBrandId = 'Brand is required.'
    if (!productName.trim()) errors.productName = 'Product Name is required.'
    if (!productSlug.trim()) errors.productSlug = 'Slug is required.'
    if (!productVerdict.trim()) errors.productVerdict = 'Verdict is required.'
    if (!carbonationLevel || isNaN(Number(carbonationLevel)) || Number(carbonationLevel) < 1 || Number(carbonationLevel) > 10) {
      errors.carbonationLevel = 'Carbonation Level is required and must be between 1 and 10.'
    }
    // Validate URLs if provided
    if (amazonLink && !isValidUrl(amazonLink)) errors.amazonLink = 'Please enter a valid URL.'
    if (walmartLink && !isValidUrl(walmartLink)) errors.walmartLink = 'Please enter a valid URL.'
    if (instacartLink && !isValidUrl(instacartLink)) errors.instacartLink = 'Please enter a valid URL.'
    if (productWebsiteLink && !isValidUrl(productWebsiteLink)) errors.productWebsiteLink = 'Please enter a valid URL.'
    setProductValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const supabase = createClientComponentClient()

  // Load brands with product counts
  const loadBrands = useCallback(async (page: number = brandsCurrentPage) => {
    try {
      setError(null)

      // Calculate offset for pagination
      const offset = (page - 1) * BRANDS_PER_PAGE

      let query = supabase
        .from('brands')
        .select('*', { count: 'exact' })
        .order('name')
        .range(offset, offset + BRANDS_PER_PAGE - 1)

      // Apply search filter if present
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      const { data: brandsData, error: brandsError, count } = await query

      if (brandsError) {
        console.error('Error loading brands:', brandsError)
        setError('Failed to load brands')
        return
      }

      setBrandsTotalCount(count || 0)

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

      setBrands(brandsWithCounts)
    } catch (err) {
      console.error('Unexpected error loading brands:', err)
      setError('An unexpected error occurred')
    }
  }, [supabase, searchTerm, brandsCurrentPage])

  // Load products with brand info
  const loadProducts = useCallback(async (
    page: number = productsCurrentPage,
    sortByOverride?: 'product' | 'brand' | 'rating' | 'review_status',
    sortDirOverride?: 'asc' | 'desc'
  ) => {
    try {
      setError(null)
      const sortBy = sortByOverride ?? productsSortBy
      const sortDir = sortDirOverride ?? productsSortDir

      // Calculate offset for pagination
      const offset = (page - 1) * PRODUCTS_PER_PAGE

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          verdict,
          review_full,
          brand_id,
          flavor_categories,
          flavor_tags,
          carbonation_level,
          is_discontinued,
          review_status,
          created_at,
          brands (
            id,
            name,
            slug
          ),
          reviews (
            overall_rating
          )
        `, { count: 'exact' })

      // Apply search filter if present
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,verdict.ilike.%${searchTerm}%`)
      }

      // Product and review_status: sort in DB. Brand and rating: sort column isn't on products (brand is on brands, rating is computed), so fetch all, sort in JS, then slice.
      if (sortBy === 'product') {
        query = query.order('name', { ascending: sortDir === 'asc' })
      } else if (sortBy === 'review_status') {
        query = query.order('review_status', { ascending: sortDir === 'asc', nullsFirst: false })
      } else {
        query = query.order('name', { ascending: true })
      }

      if (sortBy === 'brand' || sortBy === 'rating') {
        const { data: allData, error: allError } = await query.limit(50000)
        if (allError) {
          console.error('Error loading products:', allError)
          setError('Failed to load products')
          return
        }
        const meanRating = calculateMeanRating(allData || [])
        let fullSorted = (allData || []).map(product => {
          const ratings = calculateProductRatings(product, meanRating)
          return { ...product, trueAverage: ratings.trueAverage, ratingCount: ratings.ratingCount }
        })
        if (sortBy === 'brand') {
          fullSorted = fullSorted.sort((a, b) => {
            const nameA = (getProductBrand(a)?.name ?? '').toLowerCase()
            const nameB = (getProductBrand(b)?.name ?? '').toLowerCase()
            const cmp = nameA.localeCompare(nameB)
            return sortDir === 'asc' ? cmp : -cmp
          })
        } else {
          fullSorted = fullSorted.sort((a, b) => {
            const ratingA = a.trueAverage ?? -1
            const ratingB = b.trueAverage ?? -1
            const cmp = ratingA - ratingB
            return sortDir === 'asc' ? cmp : -cmp
          })
        }
        setProductsTotalCount(fullSorted.length)
        setProducts(fullSorted.slice(offset, offset + PRODUCTS_PER_PAGE))
        return
      }

      query = query.range(offset, offset + PRODUCTS_PER_PAGE - 1)

      const { data: productsData, error: productsError, count } = await query

      if (productsError) {
        console.error('Error loading products:', productsError)
        setError('Failed to load products')
        return
      }

      // Calculate mean rating across all products for Bayesian average
      const meanRating = calculateMeanRating(productsData || [])

      // Calculate ratings for each product
      const productsWithRatings = (productsData || []).map(product => {
        const ratings = calculateProductRatings(product, meanRating)
        return {
          ...product,
          trueAverage: ratings.trueAverage,
          ratingCount: ratings.ratingCount
        }
      })

      setProductsTotalCount(count || 0)
      setProducts(productsWithRatings)
    } catch (err) {
      console.error('Unexpected error loading products:', err)
      setError('An unexpected error occurred')
    }
  }, [supabase, searchTerm, productsCurrentPage, productsSortBy, productsSortDir])

  // Fetch all brands for product form dropdown
  const fetchAllBrands = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, description, website, country_of_origin, founded_year, is_active, created_at')
        .order('name')

      if (error) {
        console.error('Error fetching brands:', error)
        return
      }

      setAllBrands(data || [])
    } catch (err) {
      console.error('Unexpected error fetching brands:', err)
    }
  }, [supabase])

  // Fetch product lines for selected brand
  const fetchProductLines = useCallback(async (brandId: string) => {
    if (!brandId) {
      setAvailableProductLines([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('product_lines')
        .select('id, name')
        .eq('brand_id', brandId)
        .order('name')

      if (error) {
        console.error('Error fetching product lines:', error)
        setAvailableProductLines([])
        return
      }

      setAvailableProductLines(data || [])
    } catch (err) {
      console.error('Unexpected error fetching product lines:', err)
      setAvailableProductLines([])
    }
  }, [supabase])

  // Fetch product lines when brand is selected
  useEffect(() => {
    if (selectedBrandId) {
      fetchProductLines(selectedBrandId)
    } else {
      setAvailableProductLines([])
      setProductLineId(null)
    }
  }, [selectedBrandId, fetchProductLines])

  // Fetch unique flavor categories from products
  const fetchFlavorCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('flavor_categories')
        .not('flavor_categories', 'eq', '{}')
        .not('flavor_categories', 'is', null)

      if (error) {
        console.error('Error fetching flavor categories:', error)
        return
      }

      // Extract and flatten all categories
      const allCategories = (data || []).reduce((acc: string[], product) => {
        return acc.concat(product.flavor_categories || [])
      }, [])

      // Get unique categories and sort
      const uniqueCategories = [...new Set(allCategories)].sort()
      setAvailableFlavorCategories(uniqueCategories)
    } catch (err) {
      console.error('Unexpected error fetching flavor categories:', err)
    }
  }, [supabase])

  // Fetch unique flavor tags from products
  const fetchFlavorTags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('flavor_tags')
        .not('flavor_tags', 'eq', '{}')
        .not('flavor_tags', 'is', null)

      if (error) {
        console.error('Error fetching flavor tags:', error)
        return
      }

      // Extract and flatten all tags
      const allTags = (data || []).reduce((acc: string[], product) => {
        return acc.concat(product.flavor_tags || [])
      }, [])

      // Get unique tags and sort
      const uniqueTags = [...new Set(allTags)].sort()
      setAvailableFlavorTags(uniqueTags)
    } catch (err) {
      console.error('Unexpected error fetching flavor tags:', err)
    }
  }, [supabase])

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

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditBrandFormError(null)
    setEditBrandSuccessMessage(null)
    setEditBrandValidationErrors({})
    if (!editingBrand) return
    if (!validateEditBrandForm()) return

    setIsSubmittingEditBrand(true)
    try {
      const trimmedName = editBrandName.trim()
      const updatePayload: {
        description: string | null
        website: string | null
        country_of_origin: string | null
        founded_year: number | null
        is_active: boolean
        name?: string
      } = {
        description: editBrandDescription.trim() || null,
        website: editBrandWebsite.trim() || null,
        country_of_origin: editBrandCountryOfOrigin.trim() || null,
        founded_year: editBrandFoundedYear === '' ? null : Number(editBrandFoundedYear),
        is_active: editBrandIsActive,
      }
      if (trimmedName !== editingBrand.name) {
        updatePayload.name = trimmedName
      }

      const { data, error } = await supabase
        .from('brands')
        .update(updatePayload)
        .eq('id', editingBrand.id)
        .select('id')
        .single()

      if (error) {
        const errorMessage = error.message || ''
        if (error.code === '23505' || errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
          if (errorMessage.includes('brands_name_key') || errorMessage.includes('name')) {
            setEditBrandFormError('A brand with this name already exists.')
          } else {
            setEditBrandFormError('A brand with this information already exists. Please check your input.')
          }
        } else {
          setEditBrandFormError(errorMessage || 'Failed to update brand.')
        }
        return
      }

      if (!data) {
        setEditBrandFormError('Update did not apply; you may not have permission.')
        return
      }

      setEditBrandSuccessMessage('Brand updated successfully!')
      await loadBrands()
      setTimeout(() => {
        setShowEditBrandModal(false)
        setEditingBrand(null)
      }, 1500)
    } catch (err) {
      console.error('Unexpected error updating brand:', err)
      setEditBrandFormError('An unexpected error occurred.')
    } finally {
      setIsSubmittingEditBrand(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setProductFormError(null)
    setProductSuccessMessage(null)
    setProductValidationErrors({})

    if (!validateProductForm()) {
      return
    }

    setIsSubmittingProduct(true)

    try {
      const uniqueSlug = await ensureUniqueSlug(productSlug, 'products')

      // Build nutrition_info JSONB object (only include provided fields)
      const nutritionInfo: NutritionInfo = {}
      if (servingSize.trim()) nutritionInfo.serving_size = servingSize.trim()
      if (calories !== '') nutritionInfo.calories = Number(calories)
      if (totalFat !== '') nutritionInfo.total_fat = Number(totalFat)
      if (sodium !== '') nutritionInfo.sodium = Number(sodium)
      if (totalCarbohydrates !== '') nutritionInfo.total_carbohydrates = Number(totalCarbohydrates)
      if (totalSugars !== '') nutritionInfo.total_sugars = Number(totalSugars)
      if (protein !== '') nutritionInfo.protein = Number(protein)
      if (ingredients.trim()) nutritionInfo.ingredients = ingredients.trim()

      // Ensure product_line_id is null if empty string
      const finalProductLineId = productLineId && productLineId.trim() !== '' ? productLineId : null

      const insertPayload: ProductInsertPayload = {
        brand_id: selectedBrandId,
        name: productName.trim(),
        slug: uniqueSlug,
        verdict: productVerdict.trim() || null,
        flavor_categories: flavorCategories.length > 0 ? flavorCategories : null,
        flavor_tags: flavorTags.length > 0 ? flavorTags : null,
        carbonation_level: Number(carbonationLevel),
        nutrition_info: Object.keys(nutritionInfo).length > 0 ? nutritionInfo : null,
        amazon_link: amazonLink.trim() || null,
        walmart_link: walmartLink.trim() || null,
        instacart_link: instacartLink.trim() || null,
        product_website_link: productWebsiteLink.trim() || null,
        is_discontinued: false
      }

      // Only include product_line_id if it's not null
      if (finalProductLineId) {
        insertPayload.product_line_id = finalProductLineId
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert(insertPayload)
        .select()
        .single()

      if (insertError) {
        console.error('Product insert error:', insertError)
        const errorMessage = insertError.message || insertError.details || ''
        const errorCode = insertError.code || insertError.hint?.match(/\((\d+)\)/)?.[1]

        if (errorCode === '23505' || errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
          if (errorMessage.includes('products_name_key') || errorMessage.includes('name')) {
            setProductFormError('A product with this name already exists for this brand.')
          } else if (errorMessage.includes('products_slug_key') || errorMessage.includes('slug')) {
            setProductFormError('A product with this slug already exists. Please try a different name or manually adjust the slug.')
          } else {
            setProductFormError('A product with this information already exists. Please check your input.')
          }
        } else {
          // Show the actual error message for debugging
          setProductFormError(`Failed to create product: ${errorMessage || 'Unknown error'}. Please check the console for details.`)
        }
        return
      }

      setProductSuccessMessage('Product created successfully!')
      // Reset form
      setSelectedBrandId('')
      setProductName('')
      setProductSlug('')
      setProductLineId(null)
      setProductVerdict('')
      setFlavorCategories([])
      setFlavorTags([])
      setCarbonationLevel('')
      setServingSize('')
      setCalories('')
      setTotalFat('')
      setSodium('')
      setTotalCarbohydrates('')
      setTotalSugars('')
      setProtein('')
      setIngredients('')
      setAmazonLink('')
      setWalmartLink('')
      setInstacartLink('')
      setProductWebsiteLink('')
      await loadProducts() // Refresh the products list
      setTimeout(() => setShowProductModal(false), 1500) // Close modal after success message
    } catch (err) {
      console.error('Unexpected error creating product:', err)
      setProductFormError('An unexpected error occurred while creating the product.')
    } finally {
      setIsSubmittingProduct(false)
    }
  }

  const handleCsvFile = async (file: File) => {
    setCsvPreview([])
    setCsvErrors([])
    setImportResult(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        setCsvErrors(['CSV file must have at least a header row and one data row.'])
        return
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['brand_id', 'name', 'slug', 'verdict', 'carbonation_level']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

      if (missingHeaders.length > 0) {
        setCsvErrors([`Missing required columns: ${missingHeaders.join(', ')}`])
        return
      }

      // Parse rows
      const rows: Array<Record<string, string>> = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: Record<string, string> = {}

        headers.forEach((header, idx) => {
          row[header] = values[idx] || ''
        })

        // Validate required fields
        if (!row.brand_id || !row.name || !row.slug || !row.verdict || !row.carbonation_level) {
          errors.push(`Row ${i + 1}: Missing required fields`)
          return
        }

        // Validate carbonation level
        const carbonation = Number(row.carbonation_level)
        if (isNaN(carbonation) || carbonation < 1 || carbonation > 10) {
          errors.push(`Row ${i + 1}: Carbonation level must be between 1 and 10`)
          return
        }

        rows.push(row)
      }

      if (errors.length > 0) {
        setCsvErrors(errors)
        return
      }

      setCsvPreview(rows)
    } catch (err) {
      console.error('Error parsing CSV:', err)
      setCsvErrors(['Failed to parse CSV file. Please check the format.'])
    }
  }

  const handleBulkImport = async () => {
    if (!csvFile || csvPreview.length === 0) return

    setIsImporting(true)
    setCsvErrors([])
    setImportResult(null)

    try {
      let successCount = 0
      let failedCount = 0
      const errors: string[] = []

      // Process products in batches
      for (const row of csvPreview) {
        try {
          // Build nutrition_info if any nutrition fields exist
          const nutritionInfo: NutritionInfo = {}
          if (row.serving_size) nutritionInfo.serving_size = row.serving_size
          if (row.calories) nutritionInfo.calories = Number(row.calories)
          if (row.total_fat) nutritionInfo.total_fat = Number(row.total_fat)
          if (row.sodium) nutritionInfo.sodium = Number(row.sodium)
          if (row.total_carbohydrates) nutritionInfo.total_carbohydrates = Number(row.total_carbohydrates)
          if (row.total_sugars) nutritionInfo.total_sugars = Number(row.total_sugars)
          if (row.protein) nutritionInfo.protein = Number(row.protein)
          if (row.ingredients) nutritionInfo.ingredients = row.ingredients

          // Parse flavor arrays
          const flavorCategories = row.flavor_categories
            ? row.flavor_categories.split(',').map(c => c.trim()).filter(c => c)
            : null
          const flavorTags = row.flavor_tags
            ? row.flavor_tags.split(',').map(t => t.trim()).filter(t => t)
            : null

          // Ensure slug is unique
          const uniqueSlug = await ensureUniqueSlug(row.slug, 'products')

          const { error } = await supabase
            .from('products')
            .insert({
              brand_id: row.brand_id,
              name: row.name.trim(),
              slug: uniqueSlug,
              product_line_id: row.product_line_id || null,
              verdict: row.verdict.trim(),
              flavor_categories: flavorCategories && flavorCategories.length > 0 ? flavorCategories : null,
              flavor_tags: flavorTags && flavorTags.length > 0 ? flavorTags : null,
              carbonation_level: Number(row.carbonation_level),
              nutrition_info: Object.keys(nutritionInfo).length > 0 ? nutritionInfo : null,
              amazon_link: row.amazon_link || null,
              walmart_link: row.walmart_link || null,
              instacart_link: row.instacart_link || null,
              product_website_link: row.product_website_link || null
            })

          if (error) {
            failedCount++
            errors.push(`${row.name}: ${error.message}`)
          } else {
            successCount++
          }
        } catch (err) {
          failedCount++
          errors.push(`${row.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      setImportResult({ success: successCount, failed: failedCount })
      if (errors.length > 0) {
        setCsvErrors(errors.slice(0, 10)) // Show first 10 errors
      }

      if (successCount > 0) {
        await loadProducts() // Refresh products list
      }
    } catch (err) {
      console.error('Error importing products:', err)
      setCsvErrors(['Failed to import products. Please try again.'])
    } finally {
      setIsImporting(false)
    }
  }

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product)
    setEditProductName(product.name)
    setEditProductBrandId(product.brand_id ?? getProductBrand(product)?.id ?? '')
    setEditProductReviewStatus(product.review_status ?? 'needs_review')
    setEditProductCarbonationLevel(product.carbonation_level)
    setEditProductIsDiscontinued(product.is_discontinued)
    setEditProductVerdict(product.verdict ?? '')
    const [taste, carbonation, value] = parseReviewFullSections(product.review_full ?? null)
    setEditProductReviewTaste(taste)
    setEditProductReviewCarbonation(carbonation)
    setEditProductReviewValue(value)
    setEditFormError(null)
    setEditSuccessMessage(null)
    setEditValidationErrors({})
    setShowEditProductModal(true)
  }

  const openEditBrandModal = (brand: Brand) => {
    setEditingBrand(brand)
    setEditBrandName(brand.name)
    setEditBrandDescription(brand.description ?? '')
    setEditBrandWebsite(brand.website ?? '')
    setEditBrandCountryOfOrigin(brand.country_of_origin ?? '')
    setEditBrandFoundedYear(brand.founded_year ?? '')
    setEditBrandIsActive(brand.is_active)
    setEditBrandFormError(null)
    setEditBrandSuccessMessage(null)
    setEditBrandValidationErrors({})
    setShowEditBrandModal(true)
  }

  const validateEditProductForm = () => {
    const errors: Record<string, string> = {}
    if (!editProductName.trim()) errors.editProductName = 'Product name is required.'
    if (!editProductBrandId) errors.editProductBrandId = 'Brand is required.'
    if (editProductCarbonationLevel < 1 || editProductCarbonationLevel > 10) {
      errors.editProductCarbonationLevel = 'Carbonation level must be between 1 and 10.'
    }
    setEditValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditFormError(null)
    setEditSuccessMessage(null)
    setEditValidationErrors({})
    if (!editingProduct) return
    if (!validateEditProductForm()) return

    setIsSubmittingEdit(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: editProductName.trim(),
          brand_id: editProductBrandId,
          verdict: editProductVerdict.trim() || null,
          review_full: (() => {
            const joined = joinReviewFullSections(editProductReviewTaste, editProductReviewCarbonation, editProductReviewValue)
            return joined || null
          })(),
          review_status: editProductReviewStatus,
          carbonation_level: editProductCarbonationLevel,
          is_discontinued: editProductIsDiscontinued,
        })
        .eq('id', editingProduct.id)
        .select('id')
        .single()

      if (error) {
        setEditFormError(error.message ?? 'Failed to update product.')
        return
      }

      if (!data) {
        setEditFormError('Update did not apply; you may not have permission.')
        return
      }

      setEditSuccessMessage('Product updated successfully!')
      await loadProducts()
      setTimeout(() => {
        setShowEditProductModal(false)
        setEditingProduct(null)
      }, 1500)
    } catch (err) {
      console.error('Unexpected error updating product:', err)
      setEditFormError('An unexpected error occurred.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Load initial data on mount - load both brands and products so counts are accurate
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)
      // Load both in parallel so both tab counts are accurate from the start
      await Promise.all([
        loadBrands(),
        loadProducts(),
        fetchAllBrands(),
        fetchFlavorCategories(),
        fetchFlavorTags()
      ])
      setLoading(false)
    }
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Reload data when tab changes to ensure fresh data
  useEffect(() => {
    // Skip if still in initial loading state
    if (loading && brands.length === 0 && products.length === 0) {
      return
    }

    async function loadTabData() {
      if (activeTab === 'brands') {
        await loadBrands()
      } else if (activeTab === 'products') {
        await loadProducts()
      }
    }
    loadTabData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]) // Only depend on activeTab, not the callback functions

  const handleProductsSort = (column: 'product' | 'brand' | 'rating' | 'review_status') => {
    const newSortBy = column
    const newSortDir = productsSortBy === column
      ? (productsSortDir === 'asc' ? 'desc' : 'asc')
      : 'asc'
    setProductsSortBy(newSortBy)
    setProductsSortDir(newSortDir)
    setProductsCurrentPage(1)
    loadProducts(1, newSortBy, newSortDir)
  }

  // Tabs with counts - show total counts regardless of pagination
  const tabs = [
    { id: 'brands' as TabType, label: 'Brands', icon: Building2, count: brandsTotalCount },
    { id: 'products' as TabType, label: 'Products', icon: Package, count: productsTotalCount }
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
          {activeTab === 'brands' ? (
            <button
              onClick={() => {
                setEditingBrand(null)
                setBrandName('')
                setBrandSlug('')
                setDescription('')
                setWebsite('')
                setCountryOfOrigin('')
                setFoundedYear('')
                setIsActive(true)
                setFormError(null)
                setSuccessMessage(null)
                setValidationErrors({})
                setIsSubmitting(false)
                setShowBrandModal(true)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Brand
            </button>
          ) : (
            <ProductAddDropdown
              onSelectSingle={() => {
                // Reset form state
                setSelectedBrandId('')
                setProductName('')
                setProductSlug('')
                setProductLineId(null)
                setProductVerdict('')
                setFlavorCategories([])
                setFlavorTags([])
                setCarbonationLevel('')
                setServingSize('')
                setCalories('')
                setTotalFat('')
                setSodium('')
                setTotalCarbohydrates('')
                setTotalSugars('')
                setProtein('')
                setIngredients('')
                setAmazonLink('')
                setWalmartLink('')
                setInstacartLink('')
                setProductWebsiteLink('')
                setProductFormError(null)
                setProductSuccessMessage(null)
                setProductValidationErrors({})
                setProductModalType('single')
                setShowProductModal(true)
              }}
              onSelectBulk={() => {
                setProductModalType('bulk')
                setShowProductModal(true)
              }}
            />
          )}
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
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id
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
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Brand
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Slug
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Country
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Founded
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Products
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => openEditBrandModal(brand)}
                >
                  <td className="px-3 py-2 text-sm font-medium text-foreground">
                    {brand.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-muted-foreground">
                    {brand.slug}
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">
                    {brand.country_of_origin || '—'}
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">
                    {brand.founded_year || '—'}
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">
                    {brand.products_count}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                      {brand.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="Edit brand"
                        onClick={() => openEditBrandModal(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
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

          {brands.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No brands found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first brand.'}
              </p>
            </div>
          )}

          {/* Pagination Controls for Brands */}
          {brandsTotalCount > BRANDS_PER_PAGE && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {((brandsCurrentPage - 1) * BRANDS_PER_PAGE) + 1}-{Math.min(brandsCurrentPage * BRANDS_PER_PAGE, brandsTotalCount)} of {brandsTotalCount} brands
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setBrandsCurrentPage(prev => prev - 1)
                    loadBrands(brandsCurrentPage - 1)
                  }}
                  disabled={brandsCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {brandsCurrentPage} of {Math.ceil(brandsTotalCount / BRANDS_PER_PAGE)}
                </span>
                <button
                  onClick={() => {
                    setBrandsCurrentPage(prev => prev + 1)
                    loadBrands(brandsCurrentPage + 1)
                  }}
                  disabled={brandsCurrentPage === Math.ceil(brandsTotalCount / BRANDS_PER_PAGE)}
                  className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => handleProductsSort('product')}
                    className="inline-flex items-center gap-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    Product
                    {productsSortBy === 'product' && (productsSortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => handleProductsSort('brand')}
                    className="inline-flex items-center gap-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    Brand
                    {productsSortBy === 'brand' && (productsSortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => handleProductsSort('rating')}
                    className="inline-flex items-center gap-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    Rating
                    {productsSortBy === 'rating' && (productsSortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => handleProductsSort('review_status')}
                    className="inline-flex items-center gap-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    Review Status
                    {productsSortBy === 'review_status' && (productsSortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </button>
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Carbonation
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="sticky top-0 z-10 bg-card px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => openEditProductModal(product)}
                >
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-foreground">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.slug}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">
                    {getProductBrand(product)?.name ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    {product.trueAverage !== undefined ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-foreground">{product.trueAverage.toFixed(1)}</span>
                        <div className="flex gap-0.5">
                          {getStarFillPercentages(product.trueAverage).map((pct, i) => (
                            <PartialStar key={i} fillPercentage={pct} size={14} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.ratingCount})</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No ratings</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-muted-foreground">
                    {product.review_status === 'review_complete'
                      ? 'Review complete'
                      : product.review_status === 'blocked'
                        ? 'Blocked'
                        : product.review_status === 'needs_review'
                          ? 'Needs review'
                          : '—'}
                  </td>
                  <td className="px-3 py-2 text-sm text-foreground">
                    Level {product.carbonation_level}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!product.is_discontinued
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                      {!product.is_discontinued ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      {!product.is_discontinued ? 'Available' : 'Discontinued'}
                    </span>
                  </td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="Edit product"
                        onClick={() => openEditProductModal(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-red-600 p-1"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {(() => {
                        const brand = getProductBrand(product)
                        return brand?.slug ? (
                          <Link
                            href={`/explore/brands/${brand.slug}/products/${product.slug}`}
                            className="text-muted-foreground hover:text-foreground p-1"
                            title="View product"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        ) : null
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
              </p>
            </div>
          )}

          {/* Pagination Controls for Products */}
          {productsTotalCount > PRODUCTS_PER_PAGE && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {((productsCurrentPage - 1) * PRODUCTS_PER_PAGE) + 1}-{Math.min(productsCurrentPage * PRODUCTS_PER_PAGE, productsTotalCount)} of {productsTotalCount} products
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setProductsCurrentPage(prev => prev - 1)
                    loadProducts(productsCurrentPage - 1)
                  }}
                  disabled={productsCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {productsCurrentPage} of {Math.ceil(productsTotalCount / PRODUCTS_PER_PAGE)}
                </span>
                <button
                  onClick={() => {
                    setProductsCurrentPage(prev => prev + 1)
                    loadProducts(productsCurrentPage + 1)
                  }}
                  disabled={productsCurrentPage === Math.ceil(productsTotalCount / PRODUCTS_PER_PAGE)}
                  className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
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
                {validationErrors.website && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.website}</p>
                )}
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
                    onChange={(e) => {
                      const value = e.target.value
                      setFoundedYear(value === '' ? '' : Number(value))
                    }}
                    required
                  />
                  {validationErrors.foundedYear && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.foundedYear}</p>
                  )}
                </div>
              </div>

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
                  {isSubmitting ? 'Creating...' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditBrandModal && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Edit Brand</h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditBrandModal(false)
                  setEditingBrand(null)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleUpdateBrand}>
              <div>
                <label htmlFor="editBrandName" className="block text-sm font-medium text-foreground mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  id="editBrandName"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Enter brand name"
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  required
                />
                {editBrandValidationErrors.editBrandName && (
                  <p className="text-sm text-red-500 mt-1">{editBrandValidationErrors.editBrandName}</p>
                )}
              </div>

              <div>
                <label htmlFor="editBrandSlug" className="block text-sm font-medium text-foreground mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  id="editBrandSlug"
                  readOnly
                  disabled
                  className="w-full px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm cursor-not-allowed"
                  value={editingBrand.slug}
                />
              </div>

              <div>
                <label htmlFor="editBrandDescription" className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  id="editBrandDescription"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  rows={3}
                  placeholder="Brief description of the brand"
                  value={editBrandDescription}
                  onChange={(e) => setEditBrandDescription(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="editBrandWebsite" className="block text-sm font-medium text-foreground mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="editBrandWebsite"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="https://example.com"
                  value={editBrandWebsite}
                  onChange={(e) => setEditBrandWebsite(e.target.value)}
                />
                {editBrandValidationErrors.editBrandWebsite && (
                  <p className="text-sm text-red-500 mt-1">{editBrandValidationErrors.editBrandWebsite}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editBrandCountryOfOrigin" className="block text-sm font-medium text-foreground mb-1">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    id="editBrandCountryOfOrigin"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="United States"
                    value={editBrandCountryOfOrigin}
                    onChange={(e) => setEditBrandCountryOfOrigin(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="editBrandFoundedYear" className="block text-sm font-medium text-foreground mb-1">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    id="editBrandFoundedYear"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="2020"
                    value={editBrandFoundedYear}
                    onChange={(e) => {
                      const value = e.target.value
                      setEditBrandFoundedYear(value === '' ? '' : Number(value))
                    }}
                  />
                  {editBrandValidationErrors.editBrandFoundedYear && (
                    <p className="text-sm text-red-500 mt-1">{editBrandValidationErrors.editBrandFoundedYear}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editBrandIsActive"
                  checked={editBrandIsActive}
                  onChange={(e) => setEditBrandIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="editBrandIsActive" className="text-sm font-medium text-foreground">
                  Active
                </label>
              </div>

              {editBrandFormError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {editBrandFormError}
                </div>
              )}

              {editBrandSuccessMessage && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  {editBrandSuccessMessage}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBrandModal(false)
                    setEditingBrand(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  disabled={isSubmittingEditBrand}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
                  disabled={isSubmittingEditBrand}
                >
                  {isSubmittingEditBrand ? 'Updating...' : 'Update Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-card shadow-lg overflow-hidden">
            <div className="flex items-center justify-between shrink-0 p-6 pb-4">
              <h2 className="text-lg font-semibold text-foreground">Edit Product</h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditProductModal(false)
                  setEditingProduct(null)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form className="flex flex-col flex-1 min-h-0 p-6 pt-0" onSubmit={handleUpdateProduct}>
              <div className="overflow-y-auto flex-1 min-h-0 space-y-4 pr-3">
                <div>
                  <label htmlFor="editProductName" className="block text-sm font-medium text-foreground mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="editProductName"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Product name"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    required
                  />
                  {editValidationErrors.editProductName && (
                    <p className="text-sm text-red-500 mt-1">{editValidationErrors.editProductName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="editProductSlug" className="block text-sm font-medium text-foreground mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    id="editProductSlug"
                    readOnly
                    disabled
                    className="w-full px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm cursor-not-allowed"
                    value={editingProduct.slug}
                  />
                </div>

                <div>
                  <label htmlFor="editProductVerdict" className="block text-sm font-medium text-foreground mb-1">
                    Verdict
                  </label>
                  <textarea
                    id="editProductVerdict"
                    className="w-full min-h-[100px] resize rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Brief verdict or review snippet"
                    value={editProductVerdict}
                    onChange={(e) => setEditProductVerdict(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editProductVerdict.trim() ? editProductVerdict.trim().split(/\s+/).filter(Boolean).length : 0} words, {editProductVerdict.length} characters
                  </p>
                </div>

                <div>
                  <label htmlFor="editProductReviewTaste" className="block text-sm font-medium text-foreground mb-1">
                    Taste & Flavor
                  </label>
                  <textarea
                    id="editProductReviewTaste"
                    className="w-full min-h-[80px] resize rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Full review section: taste and flavor"
                    value={editProductReviewTaste}
                    onChange={(e) => setEditProductReviewTaste(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editProductReviewTaste.trim() ? editProductReviewTaste.trim().split(/\s+/).filter(Boolean).length : 0} words
                  </p>
                </div>
                <div>
                  <label htmlFor="editProductReviewCarbonation" className="block text-sm font-medium text-foreground mb-1">
                    Carbonation & Mouthfeel
                  </label>
                  <textarea
                    id="editProductReviewCarbonation"
                    className="w-full min-h-[80px] resize rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Full review section: carbonation and mouthfeel"
                    value={editProductReviewCarbonation}
                    onChange={(e) => setEditProductReviewCarbonation(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editProductReviewCarbonation.trim() ? editProductReviewCarbonation.trim().split(/\s+/).filter(Boolean).length : 0} words
                  </p>
                </div>
                <div>
                  <label htmlFor="editProductReviewValue" className="block text-sm font-medium text-foreground mb-1">
                    Value & Context
                  </label>
                  <textarea
                    id="editProductReviewValue"
                    className="w-full min-h-[80px] resize rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Full review section: value and use cases"
                    value={editProductReviewValue}
                    onChange={(e) => setEditProductReviewValue(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editProductReviewValue.trim() ? editProductReviewValue.trim().split(/\s+/).filter(Boolean).length : 0} words
                  </p>
                </div>

                <div>
                  <label htmlFor="editProductBrandId" className="block text-sm font-medium text-foreground mb-1">
                    Brand *
                  </label>
                  <select
                    id="editProductBrandId"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={editProductBrandId}
                    onChange={(e) => setEditProductBrandId(e.target.value)}
                    required
                  >
                    <option value="">Select a brand</option>
                    {allBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {editValidationErrors.editProductBrandId && (
                    <p className="text-sm text-red-500 mt-1">{editValidationErrors.editProductBrandId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="editProductReviewStatus" className="block text-sm font-medium text-foreground mb-1">
                    Review Status
                  </label>
                  <select
                    id="editProductReviewStatus"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={editProductReviewStatus}
                    onChange={(e) => setEditProductReviewStatus(e.target.value)}
                  >
                    <option value="needs_review">Needs review</option>
                    <option value="review_complete">Review complete</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editProductCarbonationLevel" className="block text-sm font-medium text-foreground mb-1">
                    Carbonation Level * (1-10)
                  </label>
                  <select
                    id="editProductCarbonationLevel"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={editProductCarbonationLevel}
                    onChange={(e) => setEditProductCarbonationLevel(Number(e.target.value))}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {editValidationErrors.editProductCarbonationLevel && (
                    <p className="text-sm text-red-500 mt-1">{editValidationErrors.editProductCarbonationLevel}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="editProductStatus" className="block text-sm font-medium text-foreground mb-1">
                    Status
                  </label>
                  <select
                    id="editProductStatus"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={editProductIsDiscontinued ? 'discontinued' : 'available'}
                    onChange={(e) => setEditProductIsDiscontinued(e.target.value === 'discontinued')}
                  >
                    <option value="available">Available</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>

              {editFormError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {editFormError}
                </div>
              )}

              {editSuccessMessage && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  {editSuccessMessage}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false)
                    setEditingProduct(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  disabled={isSubmittingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
                  disabled={isSubmittingEdit}
                >
                  {isSubmittingEdit ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {productModalType === 'single' ? 'Add New Product' : 'Bulk Import Products'}
              </h2>
              <button
                onClick={() => {
                  setShowProductModal(false)
                  // Reset form when closing
                  if (productModalType === 'single') {
                    setSelectedBrandId('')
                    setProductName('')
                    setProductSlug('')
                    setProductLineId(null)
                    setProductVerdict('')
                    setFlavorCategories([])
                    setFlavorTags([])
                    setCarbonationLevel('')
                    setServingSize('')
                    setCalories('')
                    setTotalFat('')
                    setSodium('')
                    setTotalCarbohydrates('')
                    setTotalSugars('')
                    setProtein('')
                    setIngredients('')
                    setAmazonLink('')
                    setWalmartLink('')
                    setInstacartLink('')
                    setProductWebsiteLink('')
                    setProductFormError(null)
                    setProductSuccessMessage(null)
                    setProductValidationErrors({})
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {productModalType === 'single' ? (
              <form className="space-y-4" onSubmit={handleCreateProduct}>
                {/* Brand Selection */}
                <div>
                  <label htmlFor="selectedBrandId" className="block text-sm font-medium text-foreground mb-1">
                    Brand *
                  </label>
                  <select
                    id="selectedBrandId"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    required
                  >
                    <option value="">Select a brand</option>
                    {allBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {productValidationErrors.selectedBrandId && (
                    <p className="text-sm text-red-500 mt-1">{productValidationErrors.selectedBrandId}</p>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-foreground mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                  {productValidationErrors.productName && (
                    <p className="text-sm text-red-500 mt-1">{productValidationErrors.productName}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="productSlug" className="block text-sm font-medium text-foreground mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="productSlug"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="auto-generated-slug"
                    value={productSlug}
                    onChange={(e) => setProductSlug(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-generated from name, editable
                  </p>
                  {productValidationErrors.productSlug && (
                    <p className="text-sm text-red-500 mt-1">{productValidationErrors.productSlug}</p>
                  )}
                </div>

                {/* Product Line - only show if brand has product lines */}
                {availableProductLines.length > 0 && (
                  <div>
                    <label htmlFor="productLineId" className="block text-sm font-medium text-foreground mb-1">
                      Product Line
                    </label>
                    <select
                      id="productLineId"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                      value={productLineId || ''}
                      onChange={(e) => setProductLineId(e.target.value || null)}
                    >
                      <option value="">None</option>
                      {availableProductLines.map((line) => (
                        <option key={line.id} value={line.id}>
                          {line.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Verdict */}
                <div>
                  <label htmlFor="productVerdict" className="block text-sm font-medium text-foreground mb-1">
                    Verdict *
                  </label>
                  <textarea
                    id="productVerdict"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    rows={3}
                    placeholder="Brief verdict/review of the product"
                    value={productVerdict}
                    onChange={(e) => setProductVerdict(e.target.value)}
                    required
                  />
                  {productValidationErrors.productVerdict && (
                    <p className="text-sm text-red-500 mt-1">{productValidationErrors.productVerdict}</p>
                  )}
                </div>

                {/* Flavor Categories */}
                <div>
                  <label htmlFor="flavorCategories" className="block text-sm font-medium text-foreground mb-1">
                    Flavor Categories
                  </label>
                  <select
                    id="flavorCategories"
                    multiple
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[100px]"
                    value={flavorCategories}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      setFlavorCategories(selected)
                    }}
                  >
                    {availableFlavorCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hold Ctrl/Cmd to select multiple categories
                  </p>
                </div>

                {/* Flavor Tags */}
                <div>
                  <label htmlFor="flavorTags" className="block text-sm font-medium text-foreground mb-1">
                    Flavor Tags
                  </label>
                  <select
                    id="flavorTags"
                    multiple
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[100px]"
                    value={flavorTags}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      setFlavorTags(selected)
                    }}
                  >
                    {availableFlavorTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hold Ctrl/Cmd to select multiple tags
                  </p>
                </div>

                {/* Carbonation Level */}
                <div>
                  <label htmlFor="carbonationLevel" className="block text-sm font-medium text-foreground mb-1">
                    Carbonation Level * (1-10)
                  </label>
                  <input
                    type="number"
                    id="carbonationLevel"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="6"
                    min="1"
                    max="10"
                    value={carbonationLevel}
                    onChange={(e) => setCarbonationLevel(e.target.value ? Number(e.target.value) : '')}
                    required
                  />
                  {productValidationErrors.carbonationLevel && (
                    <p className="text-sm text-red-500 mt-1">{productValidationErrors.carbonationLevel}</p>
                  )}
                </div>

                {/* Nutrition Information Section */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Nutrition Information (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="servingSize" className="block text-sm font-medium text-foreground mb-1">
                        Serving Size
                      </label>
                      <input
                        type="text"
                        id="servingSize"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="12 FL OZ (355ML)"
                        value={servingSize}
                        onChange={(e) => setServingSize(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="calories" className="block text-sm font-medium text-foreground mb-1">
                        Calories
                      </label>
                      <input
                        type="number"
                        id="calories"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="0"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                    <div>
                      <label htmlFor="totalFat" className="block text-sm font-medium text-foreground mb-1">
                        Total Fat (g)
                      </label>
                      <input
                        type="number"
                        id="totalFat"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="0"
                        value={totalFat}
                        onChange={(e) => setTotalFat(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                    <div>
                      <label htmlFor="sodium" className="block text-sm font-medium text-foreground mb-1">
                        Sodium (mg)
                      </label>
                      <input
                        type="number"
                        id="sodium"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="0"
                        value={sodium}
                        onChange={(e) => setSodium(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                    <div>
                      <label htmlFor="totalCarbohydrates" className="block text-sm font-medium text-foreground mb-1">
                        Total Carbohydrates (g)
                      </label>
                      <input
                        type="number"
                        id="totalCarbohydrates"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="0"
                        value={totalCarbohydrates}
                        onChange={(e) => setTotalCarbohydrates(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                    <div>
                      <label htmlFor="totalSugars" className="block text-sm font-medium text-foreground mb-1">
                        Total Sugars (g)
                      </label>
                      <input
                        type="number"
                        id="totalSugars"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="0"
                        value={totalSugars}
                        onChange={(e) => setTotalSugars(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                    <div>
                      <label htmlFor="protein" className="block text-sm font-medium text-foreground mb-1">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        id="protein"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="0"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="ingredients" className="block text-sm font-medium text-foreground mb-1">
                      Ingredients
                    </label>
                    <textarea
                      id="ingredients"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                      rows={3}
                      placeholder="List of ingredients"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                    />
                  </div>
                </div>

                {/* Affiliate Links Section */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Affiliate Links (Optional)</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="amazonLink" className="block text-sm font-medium text-foreground mb-1">
                        Amazon Link
                      </label>
                      <input
                        type="url"
                        id="amazonLink"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="https://amazon.com/..."
                        value={amazonLink}
                        onChange={(e) => setAmazonLink(e.target.value)}
                      />
                      {productValidationErrors.amazonLink && (
                        <p className="text-sm text-red-500 mt-1">{productValidationErrors.amazonLink}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="walmartLink" className="block text-sm font-medium text-foreground mb-1">
                        Walmart Link
                      </label>
                      <input
                        type="url"
                        id="walmartLink"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="https://walmart.com/..."
                        value={walmartLink}
                        onChange={(e) => setWalmartLink(e.target.value)}
                      />
                      {productValidationErrors.walmartLink && (
                        <p className="text-sm text-red-500 mt-1">{productValidationErrors.walmartLink}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="instacartLink" className="block text-sm font-medium text-foreground mb-1">
                        Instacart Link
                      </label>
                      <input
                        type="url"
                        id="instacartLink"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="https://instacart.com/..."
                        value={instacartLink}
                        onChange={(e) => setInstacartLink(e.target.value)}
                      />
                      {productValidationErrors.instacartLink && (
                        <p className="text-sm text-red-500 mt-1">{productValidationErrors.instacartLink}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="productWebsiteLink" className="block text-sm font-medium text-foreground mb-1">
                        Product Website Link
                      </label>
                      <input
                        type="url"
                        id="productWebsiteLink"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        placeholder="https://productwebsite.com/..."
                        value={productWebsiteLink}
                        onChange={(e) => setProductWebsiteLink(e.target.value)}
                      />
                      {productValidationErrors.productWebsiteLink && (
                        <p className="text-sm text-red-500 mt-1">{productValidationErrors.productWebsiteLink}</p>
                      )}
                    </div>
                  </div>
                </div>

                {productFormError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {productFormError}
                  </div>
                )}

                {productSuccessMessage && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {productSuccessMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    disabled={isSubmittingProduct}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
                    disabled={isSubmittingProduct}
                  >
                    {isSubmittingProduct ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* CSV Column Requirements */}
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">CSV Column Requirements</h3>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div>
                      <p className="font-medium mb-1">Required columns (copy this as first row):</p>
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono break-all">
                        brand_id,name,slug,verdict,carbonation_level
                      </code>
                    </div>
                    <div>
                      <p className="font-medium mb-1">All columns (copy this as first row for full import):</p>
                      <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono break-all">
                        brand_id,name,slug,verdict,carbonation_level,product_line_id,flavor_categories,flavor_tags,serving_size,calories,total_fat,sodium,total_carbohydrates,total_sugars,protein,ingredients,amazon_link,walmart_link,instacart_link,product_website_link
                      </code>
                    </div>
                    <div className="text-xs space-y-1">
                      <p>• <strong>brand_id:</strong> UUID from brands table</p>
                      <p>• <strong>carbonation_level:</strong> Number 1-10</p>
                      <p>• <strong>flavor_categories/flavor_tags:</strong> Comma-separated values</p>
                      <p>• All other columns are strings unless specified</p>
                    </div>
                  </div>
                </div>

                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const file = e.dataTransfer.files[0]
                    if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
                      setCsvFile(file)
                      handleCsvFile(file)
                    }
                  }}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-foreground mb-2">
                    Drag and drop your CSV file here, or
                  </p>
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-sm text-primary hover:text-primary/80 underline">
                      click to browse
                    </span>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCsvFile(file)
                          handleCsvFile(file)
                        }
                      }}
                    />
                  </label>
                  {csvFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>

                {/* CSV Preview */}
                {csvPreview.length > 0 && (
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Preview ({csvPreview.length} products)
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {csvPreview.slice(0, 5).map((row, idx) => (
                        <div key={idx} className="truncate">
                          Row {idx + 1}: {row.name || 'No name'}
                        </div>
                      ))}
                      {csvPreview.length > 5 && (
                        <p>... and {csvPreview.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* CSV Errors */}
                {csvErrors.length > 0 && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                      Validation Errors:
                    </h4>
                    <ul className="text-xs text-red-600 dark:text-red-300 space-y-1 list-disc list-inside">
                      {csvErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Import Result */}
                {importResult && (
                  <div className={`rounded-md p-3 ${importResult.failed === 0
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    }`}>
                    <p className="text-sm">
                      Import completed: {importResult.success} successful, {importResult.failed} failed
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false)
                      setCsvFile(null)
                      setCsvPreview([])
                      setCsvErrors([])
                      setImportResult(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    disabled={isImporting}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
                    disabled={!csvFile || csvPreview.length === 0 || isImporting || csvErrors.length > 0}
                  >
                    {isImporting ? 'Importing...' : 'Import Products'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
