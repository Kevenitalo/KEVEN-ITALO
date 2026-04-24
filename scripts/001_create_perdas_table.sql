-- Tabela para armazenar os itens de perdas
CREATE TABLE IF NOT EXISTS public.perdas (
  id SERIAL PRIMARY KEY,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('maturacao', 'avaria', 'vencimento')),
  loja TEXT NOT NULL DEFAULT 'Sem loja',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.perdas ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (qualquer um pode ver)
CREATE POLICY "perdas_select_public" ON public.perdas 
  FOR SELECT 
  USING (true);

-- Política para insert (apenas usuários autenticados)
CREATE POLICY "perdas_insert_authenticated" ON public.perdas 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para update (apenas usuários autenticados)
CREATE POLICY "perdas_update_authenticated" ON public.perdas 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Política para delete (apenas usuários autenticados)
CREATE POLICY "perdas_delete_authenticated" ON public.perdas 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_perdas_categoria ON public.perdas(categoria);
CREATE INDEX IF NOT EXISTS idx_perdas_loja ON public.perdas(loja);
