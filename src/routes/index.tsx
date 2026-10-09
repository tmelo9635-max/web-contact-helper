import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { UserPlus, Trash2, Users, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadastro de Pessoas" },
      {
        name: "description",
        content:
          "Cadastre pessoas com nome, e-mail, telefone e cidade. Formulário com validação e lista de cadastrados.",
      },
      { property: "og:title", content: "Cadastro de Pessoas" },
      {
        property: "og:description",
        content:
          "Cadastre pessoas com nome, e-mail, telefone e cidade. Formulário com validação e lista de cadastrados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CadastroPage,
});

const pessoaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "O nome completo é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um e-mail válido.")
    .max(255, "O e-mail deve ter no máximo 255 caracteres."),
  telefone: z
    .string()
    .trim()
    .max(20, "O telefone deve ter no máximo 20 caracteres.")
    .optional(),
  cidade: z
    .string()
    .trim()
    .max(100, "A cidade deve ter no máximo 100 caracteres.")
    .optional(),
});

type Pessoa = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
};

type Erros = Partial<Record<"nome" | "email" | "telefone" | "cidade", string>>;

const campoVazio = { nome: "", email: "", telefone: "", cidade: "" };

function CadastroPage() {
  const [campos, setCampos] = useState(campoVazio);
  const [erros, setErros] = useState<Erros>({});
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [sucesso, setSucesso] = useState(false);

  function atualizar(campo: keyof typeof campoVazio, valor: string) {
    setCampos((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anterior) => ({ ...anterior, [campo]: undefined }));
    setSucesso(false);
  }

  function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    const resultado = pessoaSchema.safeParse(campos);

    if (!resultado.success) {
      const novosErros: Erros = {};
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0] as keyof Erros;
        if (!novosErros[campo]) novosErros[campo] = problema.message;
      }
      setErros(novosErros);
      setSucesso(false);
      return;
    }

    const dados = resultado.data;
    setPessoas((anterior) => [
      ...anterior,
      {
        id: crypto.randomUUID(),
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone ?? "",
        cidade: dados.cidade ?? "",
      },
    ]);
    setCampos(campoVazio);
    setErros({});
    setSucesso(true);
  }

  function excluir(id: string) {
    setPessoas((anterior) => anterior.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cadastro de Pessoas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados abaixo para adicionar uma pessoa à lista.
          </p>
        </header>

        <form
          onSubmit={aoEnviar}
          noValidate
          className="rounded-2xl border border-border bg-card p-6 shadow-elegant sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="nome"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Nome completo <span className="text-destructive">*</span>
              </label>
              <input
                id="nome"
                type="text"
                value={campos.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                placeholder="Ex.: Maria Silva"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              {erros.nome && (
                <p className="mt-1.5 text-sm text-destructive">{erros.nome}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                E-mail <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={campos.email}
                onChange={(e) => atualizar("email", e.target.value)}
                placeholder="Ex.: maria@email.com"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              {erros.email && (
                <p className="mt-1.5 text-sm text-destructive">{erros.email}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="telefone"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Telefone
                </label>
                <input
                  id="telefone"
                  type="tel"
                  value={campos.telefone}
                  onChange={(e) => atualizar("telefone", e.target.value)}
                  placeholder="Ex.: (11) 98765-4321"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                {erros.telefone && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {erros.telefone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cidade"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Cidade
                </label>
                <input
                  id="cidade"
                  type="text"
                  value={campos.cidade}
                  onChange={(e) => atualizar("cidade", e.target.value)}
                  placeholder="Ex.: São Paulo"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                {erros.cidade && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {erros.cidade}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Cadastrar
          </button>

          {sucesso && (
            <div
              role="status"
              className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              Pessoa cadastrada com sucesso!
            </div>
          )}
        </form>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              Pessoas cadastradas
            </h2>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {pessoas.length}
            </span>
          </div>

          {pessoas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma pessoa cadastrada ainda.
            </p>
          ) : (
            <ul className="grid gap-3">
              {pessoas.map((pessoa) => (
                <li
                  key={pessoa.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {pessoa.nome}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {pessoa.email}
                    </p>
                    {(pessoa.telefone || pessoa.cidade) && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[pessoa.telefone, pessoa.cidade]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => excluir(pessoa.id)}
                    aria-label={`Excluir ${pessoa.nome}`}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
