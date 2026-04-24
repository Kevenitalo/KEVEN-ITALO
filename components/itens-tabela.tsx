"use client"

import { useState, useMemo } from "react"
import { ItemPerda } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, List, Store } from "lucide-react"

interface ItensTabeaProps {
  itens: ItemPerda[]
}

const categoriaConfig = {
  maturacao: { label: "Maturação", color: "bg-amber-500" },
  avaria: { label: "Avaria", color: "bg-red-500" },
  vencimento: { label: "Vencimento", color: "bg-blue-500" },
}

type Categoria = "todos" | "maturacao" | "avaria" | "vencimento"

export function ItensTabela({ itens }: ItensTabeaProps) {
  const [filtro, setFiltro] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria>("todos")
  const [lojaFiltro, setLojaFiltro] = useState<string>("todas")

  const lojas = useMemo(() => {
    const lojasSet = new Set(itens.map((item) => item.loja))
    return Array.from(lojasSet).sort()
  }, [itens])

  const itensFiltrados = itens.filter((item) => {
    const termoBusca = filtro.toLowerCase()
    const matchCodigo = item.codigo.toLowerCase().includes(termoBusca)
    const matchDescricao = item.descricao.toLowerCase().includes(termoBusca)
    const matchCategoria =
      categoriaFiltro === "todos" || item.categoria === categoriaFiltro
    const matchLoja = lojaFiltro === "todas" || item.loja === lojaFiltro
    return (matchCodigo || matchDescricao) && matchCategoria && matchLoja
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const totalFiltrado = itensFiltrados.reduce(
    (acc, item) => acc + item.valor,
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Itens Detalhados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <Select value={lojaFiltro} onValueChange={setLojaFiltro}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as lojas</SelectItem>
                  {lojas.map((loja) => (
                    <SelectItem key={loja} value={loja}>
                      {loja}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={categoriaFiltro === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFiltro("todos")}
            >
              Todos
            </Button>
            <Button
              variant={categoriaFiltro === "maturacao" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFiltro("maturacao")}
              className={
                categoriaFiltro === "maturacao"
                  ? "bg-amber-500 hover:bg-amber-600"
                  : ""
              }
            >
              Maturação
            </Button>
            <Button
              variant={categoriaFiltro === "avaria" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFiltro("avaria")}
              className={
                categoriaFiltro === "avaria"
                  ? "bg-red-500 hover:bg-red-600"
                  : ""
              }
            >
              Avaria
            </Button>
            <Button
              variant={categoriaFiltro === "vencimento" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFiltro("vencimento")}
              className={
                categoriaFiltro === "vencimento"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : ""
              }
            >
              Vencimento
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead className="w-32">Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              ) : (
                itensFiltrados.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.codigo}
                    </TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Store className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.loja}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${categoriaConfig[item.categoria].color} text-white`}
                      >
                        {categoriaConfig[item.categoria].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatarMoeda(item.valor)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>
            {itensFiltrados.length} de {itens.length} itens
            {lojaFiltro !== "todas" && ` (Loja: ${lojaFiltro})`}
          </span>
          <span className="font-semibold text-foreground">
            Total: {formatarMoeda(totalFiltrado)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
