import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface UploadFotoProdutoResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function useUploadProdutoFoto() {
  const [carregando, setCarregando] = useState(false);

  const uploadarFoto = useCallback(
    async (empresaId: string, arquivo: File): Promise<UploadFotoProdutoResult> => {
      // Validações no cliente
      if (!empresaId) {
        return {
          success: false,
          error:
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }

      if (!arquivo.type.startsWith("image/")) {
        return {
          success: false,
          error: "Envie uma imagem (JPG, PNG ou WebP).",
        };
      }

      if (arquivo.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: "Imagem muito grande. Envie uma foto de até 5 MB.",
        };
      }

      setCarregando(true);

      try {
        const ext = arquivo.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${empresaId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("uniq_me_produtos")
          .upload(path, arquivo, {
            contentType: arquivo.type,
            upsert: false,
          });

        if (uploadError) {
          return { success: false, error: uploadError.message };
        }

        const { data } = supabase.storage
          .from("uniq_me_produtos")
          .getPublicUrl(path);

        return { success: true, url: data.publicUrl };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao enviar a foto.",
        };
      } finally {
        setCarregando(false);
      }
    },
    [],
  );

  return { uploadarFoto, carregando };
}
