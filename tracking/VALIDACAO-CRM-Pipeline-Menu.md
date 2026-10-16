# 👀 PASSO A PASSO — Validação do CRM (fundador, 16/10/2026)

**O que foi entregue:** Pipeline de negociações 100% salvo no banco + CRM no menu (notebook e celular).
**Deploy:** https://base-uniq.vercel.app (Vercel READY, commit `c500c92`).
**Rollo por tenant:** cada empresa logada vê as PRÓPRIAS etapas e negociações (UNIQ Empresas, Gráfica HQ, Doceê e Loja Teste01 têm etapas separadas no banco).

---

## 1️⃣ CRM no menu — Notebook
1. Abra https://base-uniq.vercel.app e faça login (empresa UNIQ ou a que for testar).
2. Na barra lateral (rail), procure **CRM** logo abaixo de **Financeiro**.
   ✅ Esperado: ícone de quadro (kanban) + CRM em destaque aberto.
3. Após abrir, a barra branca ao lado do rail deve mostrar: **Visão Geral · Pipeline · Clientes · Configurações**.

## 2️⃣ CRM no menu — Celular
4. No celular, toque no ☰ (hambúrguer, topo esquerdo).
5. O drawer escuro deve listar **CRM** entre Financeiro e Chatbot/Loja.
6. Toque em CRM → aparecem os MESMOS 4 filhos (Visão Geral, Pipeline, Clientes, Configurações).
   ✅ Esperado: exatamente igual ao notebook.

## 3️⃣ Pipeline — criar negociação (o teste com o futuro cliente)
7. Menu → CRM → **Pipeline**.
8. Clique em **+ Nova Negociação** (topo direito).
9. Preencha: cliente (lista real do CRM — pode cadastrar antes em Clientes se o futuro cliente ainda não existe), título (ex.: "Setup Transformação Digital"), valor (R$), data de fechamento.
10. Salvar.
    ✅ Esperado: card aparece na 1ª coluna (ex.: Prospecção), com initials, valor e probabilidade.
    ⚠️ Se der erro, o toast mostra a mensagem REAL do banco — copie e me mande.

## 4️⃣ Pipeline — arrastar entre etapas
11. Arraste o card para outra coluna (ex.: Primeiro Contato).
    ✅ Esperado: card muda de coluna, toast de sucesso.
12. **Recarregue a página (F5)**.
    ✅ Esperado: card CONTINUA na nova etapa (estava salvo no banco).
13. Volte a arrastar de volta e recarregue — confirmar que "dias parado" recomeça (trigger `estagio_desde`).
14. Deixe um card sem mexer por 7+ dias (ou teste depois) → aparece ⚠ "X dias parado".

## 5️⃣ Pipeline — detalhe/edição/exclusão
15. Clique em qualquer card.
    ✅ Esperado: modal com título, valor, data, cliente, etapa e **Excluir** (pede confirmação em 2 toques — não exclui sem querer).
16. Troque algo (ex.: valor) e salve → card reflete na hora; recarregue e confirme persistência.

## 6️⃣ Pipeline — KPIs e filtro (o que mostrar ao cliente)
17. Nos números do topo do Pipeline: confira que **soma o valor das negociações reais** em aberto, ganhos do mês, em atraso e ativas.
18. Use o filtro de cliente no header: só aquele cliente aparece; banner de vazio com "Limpar filtro".

## 7️⃣ Estados (robustez do demo)
- Coluna vazia: visual normal (sem card).
- Sem nenhuma negociação: botão grande **"Criar primeira negociação"**.
- Cliente sem negociação + filtro ativo: banner "nenhuma negociação deste cliente" + limpar filtro.

## 8️⃣ Isolamento por empresa (multi-tenant — importante antes de mostrar cíiente)
19. Crie 1 negociação em uma empresa (ex.: UNIQ) e depois entre com outra empresa.
    ✅ Esperado: a outra empresa NÃO vê a negociação nem as mesmas etapas.

---

## Se algo falhar
- Mensagem de erro real em toast → me mande print/texto.
- Rollback completo: `git revert c500c92` (deploy reverte sozinho pelo push); migração é aditiva e inofensiva — não precisa reverter.
- 🔒 Nota de segurança (já relatada antes, não mexi): 92 tabelas estão **sem RLS** (incl. CRM). Com o app em uso real, vale habilitar + políticas por empresa numa sprint de segurança.

---

# ? NOVO (16/10, tarde) � Etapas em Configura��es + Dashboard real

## 9?? Etapas do Pipeline edit�veis
1. CRM ? **Configura��es** ? se��o **Etapas do Pipeline** (abaixo das Tags � mesmo visual de Tags, como voc� pediu).
2. **Criar etapa:** nome + cor (paleta de bolinhas + seletor de cor nativo) ? Adicionar ? etapa entra no fim da lista.
3. **Editar:** clique no l�pis ? mude nome/cor ? Salvar.
   ? Teste importante: crie uma negocia��o, depois RENOMEIE a etapa dela ? a negocia��o deve seguir a etapa nova (rename migra os cards).
4. **Reordenar:** setas ?? ? a ordem reflete no kanban /crm/pipeline.
5. **Excluir:** ?? ? confirma em 2 toques. Com negocia��es na etapa deve BLOQUEAR ("Mova as N negocia��es antes"). �nica etapa restante tamb�m bloqueia.
6. Cor salvo sempre em hex (fun��o no kanban ficou consistente).

## ?? Dashboard CRM real
1. CRM ? **Vis�o Geral**.
2. KPIs somando dados do BANCO: clientes totais/ativos, valor do pipeline aberto, convers�o (� at� haver ganho/perdido).
3. **Funil por etapa** com os NOMES E CORES que voc� configurou na se��o acima.
4. **Card escuro "Aten��o"**: s� negocia��es realmente paradas =7 dias (com dias reais) � vazio mostra "Tudo em dia".
5. **Clientes recentes** = �ltimos criados no banco (soma de compras se houver vendas ligadas ao cliente).
6. **Per�odo** (Todos/30d/90d) filtra os KPIs de verdade.
7. **Celular:** 4 KPIs em quadrinhos menores (2 colunas), tamanho da fonte reduzido � igual padr�o do dashboard de Estoque.
8. Estados: recarregue com F5 � skeleton aparece e depois os dados reais; sem clientes/negocia��es ? CTA "Cadastrar primeiro cliente" / funil vazio.

## Ordem sugerida do teste EB demo com o futuro cliente
1. Menu CRM (notebook + celular) ? 2. Configura��es (etapas + cores) ? 3. Pipeline (criar cliente do prospect + negocia��o, arrastar) ? 4. Vis�o Geral (mostrar funil/conversao) ? 5. Recarregar tudo para provar que ficou salvo.
