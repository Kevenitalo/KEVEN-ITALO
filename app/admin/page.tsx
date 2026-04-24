"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/client"
import { LinhaExcel } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, Loader2, Lock, CheckCircle, AlertCircle, Trash2 } from "lucide-react"

interface ItemParaSalvar {
  codigo: string
  descricao: string
  valor: number
  categoria: "maturacao" | "avaria" | "vencimento"
  loja: string
}

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState("")
  const [erroSenha, setErroSenha] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [nomeArquivo, setNomeArquivo] = useState("")
  const [totalItens, setTotalItens] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerificando(true)
    setErroSenha(false)
    
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      })
      
      if (res.ok) {
        setAutenticado(true)
      } else {
        setErroSenha(true)
      }
    } catch {
      setErroSenha(true)
    } finally {
      setVerificando(false)
    }
  }

  const processarAba = useCallback(
    (
      sheet: XLSX.WorkSheet,
      categoria: ItemParaSalvar["categoria"]
    ): ItemParaSalvar[] => {
      const linhas = XLSX.utils.sheet_to_json<LinhaExcel>(sheet)
      const itens: ItemParaSalvar[] = []

      const colunas = linhas.length > 0 ? Object.keys(linhas[0]) : []

      linhas.forEach((linha, index) => {
        const valor = Math.abs(linha["Valor"] || 0)

        if (valor > 0) {
          const codigo =
            linha["Produto"] ||
            linha[colunas[2]] ||
            "-"

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
            codigo: String(codigo),
            descricao: String(descricao),
            valor,
            categoria,
            loja: String(loja),
          })
        }
      })

      return itens
    },
    []
  )

  const handleFileUpload = useCallback(
    async (file: File) => {
      setLoading(true)
      setMessage(null)

      try {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)

        const maturacaoItens = processarAba(
          workbook.Sheets["339(Maturação)"],
          "maturacao"
        )
        const avariaItens = processarAba(
          workbook.Sheets["334(Avaria)"],
          "avaria"
        )
        const vencimentoItens = processarAba(
          workbook.Sheets["338(Vencimento)"],
          "vencimento"
        )

        const todosItens = [...maturacaoItens, ...avariaItens, ...vencimentoItens]

        // Deletar dados antigos
        const { error: deleteError } = await supabase
          .from("perdas")
          .delete()
          .neq("id", 0)

        if (deleteError) {
          throw new Error("Erro ao limpar dados antigos: " + deleteError.message)
        }

        // Inserir novos dados em lotes de 100
        const batchSize = 100
        for (let i = 0; i < todosItens.length; i += batchSize) {
          const batch = todosItens.slice(i, i + batchSize)
          const { error: insertError } = await supabase
            .from("perdas")
            .insert(batch)

          if (insertError) {
            throw new Error("Erro ao inserir dados: " + insertError.message)
          }
        }

        setNomeArquivo(file.name)
        setTotalItens(todosItens.length)
        setMessage({
          type: "success",
          text: `${todosItens.length} itens atualizados com sucesso!`,
        })
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Erro ao processar arquivo",
        })
      } finally {
        setLoading(false)
      }
    },
    [processarAba, supabase]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith(".xlsx")) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const handleLimparDados = async () => {
    if (!confirm("Tem certeza que deseja limpar todos os dados?")) return
    
    setLoading(true)
    const { error } = await supabase
      .from("perdas")
      .delete()
      .neq("id", 0)
    
    if (error) {
      setMessage({ type: "error", text: "Erro ao limpar dados" })
    } else {
      setMessage({ type: "success", text: "Dados limpos com sucesso!" })
      setTotalItens(0)
      setNomeArquivo("")
    }
    setLoading(false)
  }

  // Tela de login com senha
  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Digite a senha para acessar a área administrativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite a senha"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value)
                    setErroSenha(false)
                  }}
                  className={erroSenha ? "border-destructive" : ""}
                />
                {erroSenha && (
                  <p className="text-sm text-destructive">Senha incorreta</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={verificando}>
                {verificando ? "Verificando..." : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/")}
              >
                Voltar ao Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Área Administrativa</h1>
            <p className="text-muted-foreground">Atualize os dados do dashboard</p>
          </div>
          <Button variant="outline" onClick={() => setAutenticado(false)}>
            <Lock className="mr-2 h-4 w-4" />
            Bloquear
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload de Dados
            </CardTitle>
            <CardDescription>
              Faça upload do arquivo Excel com os dados de perdas (Maturação, Avaria, Vencimento)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {message.text}
              </div>
            )}

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-primary/50"
            >
              {loading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="mb-2 text-center font-medium">
                    Arraste o arquivo Excel aqui
                  </p>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    ou clique para selecionar
                  </p>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </>
              )}
            </div>

            {nomeArquivo && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <p>
                  <strong>Último arquivo:</strong> {nomeArquivo}
                </p>
                <p>
                  <strong>Total de itens:</strong> {totalItens}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                Ver Dashboard
              </Button>
              <Button
                variant="destructive"
                onClick={handleLimparDados}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
