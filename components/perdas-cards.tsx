"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DadosPerdas } from "@/lib/types"
import { Apple, PackageX, CalendarX } from "lucide-react"

interface PerdasCardsProps {
  dados: DadosPerdas
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function PerdasCards({ dados }: PerdasCardsProps) {
  const cards = [
    {
      title: "Total Maturação",
      value: dados.maturacao,
      icon: Apple,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Total Avaria",
      value: dados.avaria,
      icon: PackageX,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Vencimento",
      value: dados.vencimento,
      icon: CalendarX,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(card.value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
