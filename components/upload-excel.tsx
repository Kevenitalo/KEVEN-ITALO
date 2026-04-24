'use client'

import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PerdasData {
  loja_numero: string
  loja_nome: string
  valor_perda: number
}

interface UploadExcelProps {
  onUploadSuccess: () => void
}

export function UploadExcel({ onUploadSuccess }: UploadExcelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const processExcel = useCallback(async (file: File) => {
    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        throw new Error('O arquivo Excel está vazio')
      }

      // Mapear os dados do Excel para o formato esperado
      const perdasData: PerdasData[] = jsonData.map((row: Record<string, unknown>) => {
        // Tentar encontrar as colunas corretas (aceita variações de nomes)
        const lojaNumero = String(
          row['loja_numero'] || row['Loja Numero'] || row['LOJA_NUMERO'] || 
          row['numero'] || row['Numero'] || row['NUMERO'] ||
          row['loja'] || row['Loja'] || row['LOJA'] || ''
        )
        
        const lojaNome = String(
          row['loja_nome'] || row['Loja Nome'] || row['LOJA_NOME'] ||
          row['nome'] || row['Nome'] || row['NOME'] ||
          row['descricao'] || row['Descricao'] || row['DESCRICAO'] || ''
        )
        
        const valorPerda = Number(
          row['valor_perda'] || row['Valor Perda'] || row['VALOR_PERDA'] ||
          row['perda'] || row['Perda'] || row['PERDA'] ||
          row['valor'] || row['Valor'] || row['VALOR'] ||
          row['total'] || row['Total'] || row['TOTAL'] || 0
        )

        return {
          loja_numero: lojaNumero,
          loja_nome: lojaNome,
          valor_perda: valorPerda
        }
      })

      // Filtrar dados inválidos
      const validData = perdasData.filter(
        item => item.loja_numero && item.valor_perda > 0
      )

      if (validData.length === 0) {
        throw new Error('Nenhum dado válido encontrado. Verifique se o Excel possui colunas como: loja_numero, loja_nome, valor_perda (ou variações)')
      }

      // Enviar para o Supabase
      const supabase = createClient()
      
      // Limpar dados antigos antes de inserir novos
      await supabase.from('perdas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      const { error } = await supabase.from('perdas').insert(validData)

      if (error) {
        throw new Error(`Erro ao salvar no banco: ${error.message}`)
      }

      setStatus('success')
      setMessage(`${validData.length} registros importados com sucesso!`)
      onUploadSuccess()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Erro ao processar o arquivo')
    } finally {
      setIsLoading(false)
    }
  }, [onUploadSuccess])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processExcel(file)
    } else {
      setStatus('error')
      setMessage('Por favor, envie um arquivo Excel (.xlsx ou .xls)')
    }
  }, [processExcel])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processExcel(file)
    }
  }, [processExcel])

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400 bg-white'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {isLoading ? (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">Processando arquivo...</p>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-green-600 font-medium">{message}</p>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-600">{message}</p>
            <p className="text-sm text-gray-500">Clique ou arraste outro arquivo para tentar novamente</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <FileSpreadsheet className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">Arraste seu arquivo Excel aqui</p>
              <p className="text-sm text-gray-500">ou clique para selecionar</p>
            </div>
            <p className="text-xs text-gray-400">Formatos aceitos: .xlsx, .xls</p>
          </>
        )}
      </div>
    </div>
  )
}
