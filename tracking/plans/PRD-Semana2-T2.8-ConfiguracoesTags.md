# PRD — Configurações do CRM: Tags Personalizáveis (T2.8)

> Fase: Semana 2 · Módulo: CRM · Status: ✅ Aprovado (11/09/2026)

## Porquê (WHY)

Hoje o CRM só oferece **tags fixas** (`TAG_OPTIONS` em `ClientesPage.tsx`): `["VIP", "Prospect", "Inadimplente", "Cliente Fiel", "Lead Quente", "Inativo"]`. O fundador quer poder **escolher quais tags existem** na sua empresa, em vez de impor uma lista padrão que não serve para todo negócio.

Além disso, o modal "Novo Cliente" **não persiste nada** (simula 1,2s e fecha — toast-only), e nem `crm_leads` nem `me_cliente` têm campo de tags. Sem persistência, personalizar tags não teria sentido.

## O quê (WHAT)

1. **Tela de configurações do CRM** (`/crm/configuracoes`) para **gerenciar tags da empresa**: listar, adicionar, remover (soft delete).
2. **Tabela `me_tag`** (Supabase) com isolamento por empresa (`empresa_id`).
3. **Coluna `tags text[]`** em `crm_leads` para persistir as tags escolhidas no cliente.
4. **Modal "Novo Cliente" passa a salvar de verdade** em `crm_leads` (nome, telefone, email, tags).
5. Formulário e filtro de clientes passam a usar **as tags configuradas** (fallback para lista padrão quando vazio — mock-first).

## Escopo

- ✅ Dentro: schema, hook `use-tags`, hook `use-criar-cliente`, tela de configurações, modal/filtro atualizados, rota nova.
- ❌ Fora: cores por tag com editor completo (cor auto-atribuída), renomear tag, tags em `me_cliente` (pedidos), integração com pipeline/negociações.

## Stakeholders

Founder (dono) · Melissa (operadora) · Esposa do fundador (usuária prática — Loja Teste01)

## Critérios de aceite

- [ ] Tags configuradas aparecem no modal "Novo Cliente" e no filtro de clientes.
- [ ] Criar cliente persiste em `crm_leads` com as tags escolhidas (recarregar → tags visíveis).
- [ ] Tela de configurações lista/adiciona/remove tags com estados loading, empty, error, success.
- [ ] Isolamento por empresa (só tags da própria empresa).
- [ ] Sem sessão/empresa → fallback mock (regra 07/09/2026).