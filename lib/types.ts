export interface DadosPerdas {
  maturacao: number
  avaria: number
  vencimento: number
}

export interface ItemPerda {
  id: number
  codigo: string
  descricao: string
  valor: number
  categoria: "maturacao" | "avaria" | "vencimento"
  loja: string
}

export interface DadosCompletos {
  totais: DadosPerdas
  itens: ItemPerda[]
  atualizadoEm: string
}

export interface LinhaExcel {
  Valor?: number
  Código?: string
  Codigo?: string
  "Cód. Produto"?: string
  "Cod Produto"?: string
  SKU?: string
  Descrição?: string
  Produto?: string
  Item?: string
  Nome?: string
  Loja?: string
  Filial?: string
  Unidade?: string
  [key: string]: unknown
}
