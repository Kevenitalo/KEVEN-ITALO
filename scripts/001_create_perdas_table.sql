-- Tabela de perdas por loja
CREATE TABLE IF NOT EXISTS perdas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_numero TEXT NOT NULL,
  loja_nome TEXT NOT NULL,
  valor_perda DECIMAL(15, 2) NOT NULL,
  data_registro DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_perdas_loja_numero ON perdas(loja_numero);
CREATE INDEX IF NOT EXISTS idx_perdas_data_registro ON perdas(data_registro);

-- Habilitar RLS (Row Level Security) - sem restrições para este caso
ALTER TABLE perdas ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de perdas" ON perdas
  FOR SELECT USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Permitir inserção pública de perdas" ON perdas
  FOR INSERT WITH CHECK (true);

-- Política para permitir deleção pública
CREATE POLICY "Permitir deleção pública de perdas" ON perdas
  FOR DELETE USING (true);
