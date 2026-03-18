'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { ProductSubmissionModal } from './ProductSubmissionModal'

type ProductSubmissionContextValue = {
  openSubmissionModal: () => void
} | null

const ProductSubmissionContext = createContext<ProductSubmissionContextValue>(null)

export function ProductSubmissionProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openSubmissionModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <ProductSubmissionContext.Provider value={{ openSubmissionModal }}>
      {children}
      <ProductSubmissionModal isOpen={isOpen} onClose={closeModal} />
    </ProductSubmissionContext.Provider>
  )
}

export function useProductSubmissionModal(): ProductSubmissionContextValue {
  return useContext(ProductSubmissionContext)
}
