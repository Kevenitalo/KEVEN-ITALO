"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DadosPerdas, ItemPerda } from "@/lib/types"
import { PerdasCards } from "./perdas-cards"
import { PerdasChart } from "./perdas-chart"
import { ItensTabela } from "./itens-tabela"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Lock } from "lucide-react"
import Link from "next/link"

interface PerdasDB {
  id: number
  codigo: string
  descricao: string
  valor: number
  categoria: "maturacao" | "avaria" | "vencimento"
  loja: string
}

export function DashboardPublico() {
  const [loading, setLoading] = useState(true)
  const [totais, setTotais] = useState<DadosPerdas | null>(null)
  const [itens, setItens] = useState<ItemPerda[]>([])
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)

  const carregarDados = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("perdas")
      .select("*")
      .order("categoria", { ascending: true })

    if (error) {
      console.error("Erro ao carregar dados:", error)
      setLoading(false)
      return
    }

    const perdas = data as PerdasDB[]

    // Calcular totais
    const maturacao = perdas
      .filter((p) => p.categoria === "maturacao")
      .reduce((acc, p) => acc + Number(p.valor), 0)
    const avaria = perdas
      .filter((p) => p.categoria === "avaria")
      .reduce((acc, p) => acc + Number(p.valor), 0)
    const vencimento = perdas
      .filter((p) => p.categoria === "vencimento")
      .reduce((acc, p) => acc + Number(p.valor), 0)

    setTotais({ maturacao, avaria, vencimento })

    // Converter para ItemPerda
    const itensConvertidos: ItemPerda[] = perdas.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      descricao: p.descricao,
      valor: Number(p.valor),
      categoria: p.categoria,
      loja: p.loja,
    }))

    setItens(itensConvertidos)
    setUltimaAtualizacao(new Date())
    setLoading(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!totais || itens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <RefreshCw className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Sem dados disponíveis</h2>
          <p className="text-muted-foreground mb-6">
            Nenhum dado foi carregado ainda. Um administrador precisa fazer upload do arquivo Excel.
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/login">
              <Lock className="mr-2 h-4 w-4" />
              Área Admin
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Perdas</h1>
              {ultimaAtualizacao && (
                <p className="text-sm text-muted-foreground">
                  Atualizado em:{" "}
                  {ultimaAtualizacao.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={carregarDados}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href="/auth/login">
                  <Lock className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PerdasCards dados={totais} />
          <PerdasChart dados={totais} />
          <ItensTabela itens={itens} />
        </div>
      </main>
    </div>
  )
}
