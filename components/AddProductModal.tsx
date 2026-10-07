'use client'
import ProductEditor from './ProductEditor'
import type { CreateProductDTO } from '@/services/ProductService'
export default function AddProductModal({ onSave, onClose }: { onSave: (product: CreateProductDTO) => Promise<void>; onClose: () => void }) {
  return <ProductEditor onSave={onSave} onClose={onClose} />
}
