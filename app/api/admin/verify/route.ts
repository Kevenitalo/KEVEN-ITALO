import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { password } = await request.json()
  
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Senha de admin não configurada" },
      { status: 500 }
    )
  }
  
  if (password === adminPassword) {
    return NextResponse.json({ success: true })
  }
  
  return NextResponse.json(
    { error: "Senha incorreta" },
    { status: 401 }
  )
}
