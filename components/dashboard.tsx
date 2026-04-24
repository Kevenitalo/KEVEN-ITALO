'use client'

import { useState, useEffect, useCallback } from 'react'
import { UploadExcel } from './upload-excel'
import { PerdasChart } from './perdas-chart'
import { PerdasTable } from './perdas-table'
import { StoreFilter } from './store-filter'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TableIcon, RefreshCw, AlertTriangle } from 'lucide-react'

interface PerdasAgregada {
  loja_numero: string
  loja_nome: string
  total_perda: number
}

export function Dashboard() {
  const [data, setData] = useState<PerdasAgregada[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: perdas, error: fetchError } = await supabase
        .from('perdas')
        .select('loja_numero, loja_nome, valor_perda')
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }

      // Agregar por loja
      const agregado = (perdas || []).reduce((acc, item) => {
        const existing = acc.find(a => a.loja_numero === item.loja_numero)
        if (existing) {
          existing.total_perda += Number(item.valor_perda)
        } else {
          acc.push({
            loja_numero: item.loja_numero,
            loja_nome: item.loja_nome,
            total_perda: Number(item.valor_perda)
          })
        }
        return acc
      }, [] as PerdasAgregada[])

      setData(agregado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalPerdas = data.reduce((sum, item) => sum + item.total_perda, 0)
  const stores = data.map(d => ({ loja_numero: d.loja_numero, loja_nome: d.loja_nome }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Perdas por Loja</h1>
              <p className="text-gray-500 mt-1">Visualize e analise as perdas de cada loja</p>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Importar Dados</h2>
          <UploadExcel onUploadSuccess={fetchData} />
        </section>

        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        {data.length > 0 && (
          <>
            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Total de Perdas</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(totalPerdas)}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Lojas Analisadas</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{data.length}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Media por Loja</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(data.length > 0 ? totalPerdas / data.length : 0)}
                </p>
              </div>
            </section>

            {/* Filter */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <StoreFilter 
                stores={stores} 
                selectedStore={selectedStore} 
                onStoreChange={setSelectedStore} 
              />
            </section>

            {/* Chart */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Grafico de Perdas</h2>
              </div>
              <PerdasChart data={data} selectedStore={selectedStore} />
            </section>

            {/* Table */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <TableIcon className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Ranking de Perdas</h2>
              </div>
              <PerdasTable data={data} selectedStore={selectedStore} />
            </section>
          </>
        )}

        {!isLoading && data.length === 0 && !error && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponivel</h3>
            <p className="text-gray-500">Faca upload de um arquivo Excel para visualizar o dashboard</p>
          </div>
        )}
      </main>
    </div>
  )
}
