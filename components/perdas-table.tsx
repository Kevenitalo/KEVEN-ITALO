'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

interface PerdasData {
  loja_numero: string
  loja_nome: string
  total_perda: number
}

interface PerdasTableProps {
  data: PerdasData[]
  selectedStore: string
}

export function PerdasTable({ data, selectedStore }: PerdasTableProps) {
  const filteredData = selectedStore 
    ? data.filter(d => d.loja_numero === selectedStore)
    : data

  // Ordenar por valor de perda (maior primeiro)
  const sortedData = [...filteredData].sort((a, b) => b.total_perda - a.total_perda)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const maxPerda = Math.max(...sortedData.map(d => d.total_perda))
  const minPerda = Math.min(...sortedData.map(d => d.total_perda))

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Ranking</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Loja</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Total de Perdas</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr 
              key={item.loja_numero} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  index === 0 ? 'bg-red-100 text-red-700' :
                  index === 1 ? 'bg-orange-100 text-orange-700' :
                  index === 2 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-gray-900">{item.loja_nome || `Loja ${item.loja_numero}`}</p>
                  <p className="text-sm text-gray-500">Cod: {item.loja_numero}</p>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(item.total_perda)}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                {item.total_perda === maxPerda ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <TrendingUp className="w-3 h-3" />
                    Maior perda
                  </span>
                ) : item.total_perda === minPerda ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <TrendingDown className="w-3 h-3" />
                    Menor perda
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
