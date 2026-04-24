import { put, list, del } from "@vercel/blob"
import { NextResponse } from "next/server"
import type { DadosCompletos } from "@/lib/types"

const DADOS_FILENAME = "dados-perdas.json"

// GET - Buscar dados salvos
export async function GET() {
  try {
    const { blobs } = await list()
    const dadosBlob = blobs.find((b) => b.pathname === DADOS_FILENAME)

    if (!dadosBlob) {
      return NextResponse.json({ dados: null })
    }

    const response = await fetch(dadosBlob.url)
    const dados: DadosCompletos = await response.json()

    return NextResponse.json({ dados })
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

// POST - Salvar novos dados
export async function POST(request: Request) {
  try {
    const { dados, senha } = await request.json()

    // Verificar senha
    const adminPassword = process.env.ADMIN_PASSWORD
    if (senha !== adminPassword) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    // Deletar arquivo antigo se existir
    const { blobs } = await list()
    const dadosBlob = blobs.find((b) => b.pathname === DADOS_FILENAME)
    if (dadosBlob) {
      await del(dadosBlob.url)
    }

    // Salvar novos dados
    const dadosComData: DadosCompletos = {
      ...dados,
      atualizadoEm: new Date().toISOString(),
    }

    await put(DADOS_FILENAME, JSON.stringify(dadosComData), {
      access: "public",
      contentType: "application/json",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao salvar dados:", error)
    return NextResponse.json({ error: "Erro ao salvar dados" }, { status: 500 })
  }
}

// DELETE - Limpar dados
export async function DELETE(request: Request) {
  try {
    const { senha } = await request.json()

    // Verificar senha
    const adminPassword = process.env.ADMIN_PASSWORD
    if (senha !== adminPassword) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    const { blobs } = await list()
    const dadosBlob = blobs.find((b) => b.pathname === DADOS_FILENAME)

    if (dadosBlob) {
      await del(dadosBlob.url)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao limpar dados:", error)
    return NextResponse.json({ error: "Erro ao limpar dados" }, { status: 500 })
  }
}
