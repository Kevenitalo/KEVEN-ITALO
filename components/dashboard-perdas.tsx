"use client"

import { useState, useCallback } from "react"
import * as XLSX from "xlsx"
import { DadosCompletos, LinhaExcel, ItemPerda } from "@/lib/types"
import { UploadExcel } from "./upload-excel"
import { PerdasCards } from "./perdas-cards"
import { PerdasChart } from "./perdas-chart"
import { ItensTabela } from "./itens-tabela"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, RotateCcw } from "lucide-react"

export function DashboardPerdas() {
  const [dados, setDados] = useState<DadosCompletos | null>(null)
  const [nomeArquivo, setNomeArquivo] = useState<string>("")

  const processarAba = useCallback(
    (
      sheet: XLSX.WorkSheet,
      categoria: ItemPerda["categoria"],
      startId: number
    ): { total: number; itens: ItemPerda[] } => {
      const linhas = XLSX.utils.sheet_to_json<LinhaExcel>(sheet)
      let total = 0
      const itens: ItemPerda[] = []

      // Pegar os nomes das colunas para acessar por índice
      const colunas = linhas.length > 0 ? Object.keys(linhas[0]) : []
      console.log("[v0] Colunas:", colunas)

      linhas.forEach((linha, index) => {
        const valor = Math.abs(linha["Valor"] || 0)
        total += valor

        if (valor > 0) {
          // Coluna C (índice 2) = Produto/Código
          const codigo =
            linha["Produto"] ||
            linha[colunas[2]] ||
            "-"

          // Coluna D (índice 3) = Descrição
          const descricao =
            linha["Descrição"] ||
            linha["Descricao"] ||
            linha[colunas[3]] ||
            `Item ${index + 1}`

          const loja =
            linha["Loja"] ||
            linha["Filial"] ||
            linha["Unidade"] ||
            "Sem loja"

          itens.push({
            id: startId + index,
            codigo: String(codigo),
            descricao: String(descricao),
            valor,
            categoria,
            loja: String(loja),
          })
        }
      })

      return { total, itens }
    },
    []
  )

  const processarArquivo = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer)

      const maturacaoResult = processarAba(
        workbook.Sheets["339(Maturação)"],
        "maturacao",
        0
      )
      const avariaResult = processarAba(
        workbook.Sheets["334(Avaria)"],
        "avaria",
        1000
      )
      const vencimentoResult = processarAba(
        workbook.Sheets["338(Vencimento)"],
        "vencimento",
        2000
      )

      setDados({
        totais: {
          maturacao: maturacaoResult.total,
          avaria: avariaResult.total,
          vencimento: vencimentoResult.total,
        },
        itens: [
          ...maturacaoResult.itens,
          ...avariaResult.itens,
          ...vencimentoResult.itens,
        ],
      })
      setNomeArquivo(file.name)
    },
    [processarAba]
  )

  const resetar = useCallback(() => {
    setDados(null)
    setNomeArquivo("")
  }, [])

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard de Perdas
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize as perdas por maturação, avaria e vencimento
            </p>
          </div>

          {dados && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{nomeArquivo}</span>
              </div>
              <Button variant="outline" size="sm" onClick={resetar}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Novo arquivo
              </Button>
            </div>
          )}
        </header>

        {!dados ? (
          <UploadExcel onFileUpload={processarArquivo} />
        ) : (
          <div className="space-y-6">
            <PerdasCards dados={dados.totais} />
            <PerdasChart dados={dados.totais} />
            <ItensTabela itens={dados.itens} />
          </div>
        )}
      </div>
    </div>
  )
}
