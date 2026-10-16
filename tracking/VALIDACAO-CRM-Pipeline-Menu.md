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
