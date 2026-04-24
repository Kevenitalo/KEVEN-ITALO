'use client'

import { Store } from 'lucide-react'

interface StoreOption {
  loja_numero: string
  loja_nome: string
}

interface StoreFilterProps {
  stores: StoreOption[]
  selectedStore: string
  onStoreChange: (store: string) => void
}

export function StoreFilter({ stores, selectedStore, onStoreChange }: StoreFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <Store className="w-5 h-5 text-gray-500" />
      <select
        value={selectedStore}
        onChange={(e) => onStoreChange(e.target.value)}
        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Todas as Lojas</option>
        {stores.map((store) => (
          <option key={store.loja_numero} value={store.loja_numero}>
            {store.loja_numero} - {store.loja_nome || `Loja ${store.loja_numero}`}
          </option>
        ))}
      </select>
    </div>
  )
}
