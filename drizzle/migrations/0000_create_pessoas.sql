CREATE TABLE public.pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  cidade text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.pessoas TO anon;
GRANT ALL ON public.pessoas TO service_role;

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver os cadastros"
  ON public.pessoas FOR SELECT TO anon USING (true);

CREATE POLICY "Qualquer pessoa pode cadastrar"
  ON public.pessoas FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode excluir"
  ON public.pessoas FOR DELETE TO anon USING (true);