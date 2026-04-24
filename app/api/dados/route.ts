import { put, list, del, get } from "@vercel/blob"
import { NextResponse } from "next/server"
import type { DadosCompletos } from "@/lib/types"

const DADOS_FILENAME = "dados-perdas.json"

// GET - Buscar dados salvos
export async function GET() {
  try {
    const result = await get(DADOS_FILENAME, { access: "private" })

    if (!result) {
      return NextResponse.json({ dados: null })
    }

    const text = await result.text()
    const dados: DadosCompletos = JSON.parse(text)

    return NextResponse.json({ dados })
  } catch (error) {
    // Se o arquivo não existir, retorna null
    console.error("Erro ao buscar dados:", error)
    return NextResponse.json({ dados: null })
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
    try {
      const result = await get(DADOS_FILENAME, { access: "private" })
      if (result) {
        await del(result.blob.url)
      }
    } catch {
      // Arquivo não existe, ok
    }

    // Salvar novos dados
    const dadosComData: DadosCompletos = {
      ...dados,
      atualizadoEm: new Date().toISOString(),
    }

    await put(DADOS_FILENAME, JSON.stringify(dadosComData), {
      access: "private",
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

    try {
      const result = await get(DADOS_FILENAME, { access: "private" })
      if (result) {
        await del(result.blob.url)
      }
    } catch {
      // Arquivo não existe, ok
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao limpar dados:", error)
    return NextResponse.json({ error: "Erro ao limpar dados" }, { status: 500 })
  }
}
