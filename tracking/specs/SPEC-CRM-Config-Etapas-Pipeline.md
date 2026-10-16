# SPEC — Configuração de Etapas do Pipeline (CRM → Configurações)

**Status:** WIRE aprovado por delegação do fundador (16/10/2026). Complemento de SPEC-CRM-Pipeline-Real-Menu.
**Espera-se:** fundador escolhe etapas e cores de cada etapa em `ConfiguracoesCRMPage`, substituindo a lista "fixa" que hoje só vem do seed.

## Fonte existente
- Tabela `crm_etapas` (id serial, empresa_id, nome, posicao, cor, fixa) — já tem todas as colunas necessárias. **Sem migração.**
- `crm_oportunidades.estagio` = **nome da etapa** (string). RENOMEAR etapa exige migrar as negociações junto (ver regras).
- Probabilidade continua heurística por posição (`probabilidadePorPosicao` em `use-pipeline.ts`) — não alterar.
- Página: `src/app/components/crm/ConfiguracoesCRMPage.tsx` (226 linhas, seção de Tags com `CORES_TAG`, TagRow). Pipeline: `use-pipeline.ts` lê etapas por `posicao` a cada mount.

## Hooks novos
| Hook | Responsabilidade |
|------|------------------|
| `use-etapas-pipeline.ts` | CRUD de `crm_etapas` da empresa (`useAuth()` → empresa.id; eq empresa_id em TODAS as escritas): carregar (order posicao), criar (nome, cor hex, posicao = última + 1, fixa = false), renomear, trocar cor, reordenar (subir/descer trocando posicao), excluir. Exponer `{ etapas, carregando, erro, recarregar, criar, atualizar, mover, excluir }`. |

## Regras de negócio (obrigatórias)
1. **Renomear:** após o update da etapa, atualizar em massa `crm_oportunidades` → `update({ estagio: novoNome }).eq('empresa_id').eq('estagio', nomeAntigo)`; falha aqui não derruba o rename (log warn + toast de aviso).
2. **Excluir:** bloquear se houver negociações na etapa — contar `crm_oportunidades` (eq empresa_id, eq estagio=nome); se >0, toast "X negociações nesta etapa. Mova-as antes." e não excluir. Bloquear excluir se for a única etapa restante.
3. **Nome:** obrigatório, sem duplicado case-insensitive na mesma empresa.
4. **Cor:** hex via paleta pré-definida (mesma abordagem de `CORES_TAG`) + input `type="color"` nativo. Salvar SEMPRE hex `#rrggbb` em etapas novas/ediatadas (etapas antigas com classe tailwind continuam exibíveis; PipelinePage já faz fallback ).
5. **Reordenar:** setas ↑↓ trocando `posicao`; atualização otimista; pipeline respeita na próxima carga (recarregar no retorno ou listener).
6. Mínimo de 1 etapa; máximo arbitrário.

## UI (`ConfiguracoesCRMPage`)
- Nova seção **"Etapas do Pipeline"** abaixo das tags (segui visual do bloco de tags): lista por posicao com bolinha de cor (hex ou fallback), nome, ações: editar (inline/modal), cor, ↑↓, excluir (confirmação 2 toques).
- Botão "+ Etapa" (nome + cor) no fim da lista.
- Estados: skeleton, erro com tentar de novo, toast inseir/up/del.
- Pipeline continua funcionando sem recarregar app (busca etapas no mount).
- Sem tocar no pipeline de probabilidade; sem tocar em AppLayout; tags intocadas exceto layout coexistente.

## Checklist
- [ ] Etapas listadas da empresa no Configurações CRM com cor e ordem
- [ ] Criar/renomear/cor/ordenar/excluir com guarda empresa_id
- [ ] Rename migra negociacões (estagio) junto
- [ ] Delete bloqueado com negociações
- [ ] npm build + tsc verdes
