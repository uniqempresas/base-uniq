-- ============================================================================
-- Pendência D' do lote de 17/09/2026 — vincular conversa <-> cliente no banco
-- Aplicada em produção em 18/09/2026. SEM backfill (decisão do fundador:
-- os registros existentes são todos de teste).
--
-- DIAGNÓSTICO (verificado inspecionando o workflow `atendente_Docee`):
--   Nenhum nó escreve `crm_chat_conversas.cliente_id` — nem `Criar_Conversa1`,
--   nem `Criar_Conversa2`, nem `Atualiza_FotoContato`. O cliente É criado
--   corretamente em `me_cliente` (nó `Cria_Cliente`); o que nunca acontecia era
--   o vínculo na conversa. Daí 21/21 conversas com `cliente_id` NULL.
--
-- DESENHO: DOIS triggers, porque na PRIMEIRA mensagem a conversa nasce ANTES
-- de o cliente existir — um trigger só não cobriria os dois sentidos.
--   1. conversa gravada  -> preenche cliente_id (se o cliente já existir)
--   2. cliente gravado   -> vincula as conversas órfãs daquele telefone
-- ============================================================================

-- 1) Resolve o id do cliente por empresa + telefone normalizado.
--    Compara direto com me_cliente.telefone porque o trigger
--    trg_me_cliente_normaliza_telefone já mantém a coluna normalizada —
--    assim a comparação usa o índice único ux_me_cliente_empresa_telefone.
CREATE OR REPLACE FUNCTION public.fn_resolver_cliente_id(
  p_empresa_id uuid,
  p_telefone   text
) RETURNS uuid
LANGUAGE sql
STABLE
AS $function$
  SELECT c.id
  FROM public.me_cliente c
  WHERE c.empresa_id = p_empresa_id
    AND c.telefone IS NOT NULL
    AND c.telefone = public.fn_normalizar_telefone(p_telefone)
  ORDER BY c.criado_em ASC NULLS LAST
  LIMIT 1;
$function$;

-- 2) Ao gravar a CONVERSA, preenche cliente_id se ainda estiver vazio.
CREATE OR REPLACE FUNCTION public.trg_conversa_vincula_cliente_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.cliente_id IS NULL
     AND NEW.empresa_id IS NOT NULL
     AND NEW.canal_id  IS NOT NULL
     AND NEW.canal = 'whatsapp' THEN
    NEW.cliente_id := public.fn_resolver_cliente_id(NEW.empresa_id, NEW.canal_id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_conversa_vincula_cliente
  BEFORE INSERT OR UPDATE OF canal_id, empresa_id
  ON public.crm_chat_conversas
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_conversa_vincula_cliente_fn();

-- 3) Ao gravar o CLIENTE, vincula as conversas órfãs daquele telefone.
--    É este trigger que resolve o caso da PRIMEIRA mensagem (conversa criada
--    antes do cliente existir).
--    Não há recursão: este UPDATE altera apenas cliente_id, e o trigger 2
--    só dispara quando canal_id/empresa_id entram no SET.
CREATE OR REPLACE FUNCTION public.trg_cliente_vincula_conversas_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.telefone IS NOT NULL AND NEW.empresa_id IS NOT NULL THEN
    UPDATE public.crm_chat_conversas c
       SET cliente_id = NEW.id
     WHERE c.empresa_id  = NEW.empresa_id
       AND c.cliente_id  IS NULL
       AND c.canal       = 'whatsapp'
       AND c.canal_id    IS NOT NULL
       AND public.fn_normalizar_telefone(c.canal_id) = NEW.telefone;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE TRIGGER trg_cliente_vincula_conversas
  AFTER INSERT OR UPDATE OF telefone, empresa_id
  ON public.me_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_cliente_vincula_conversas_fn();
