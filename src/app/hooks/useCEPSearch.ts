import { useState, useCallback } from "react";
import { mockCEPData } from "../lib/mocks/suppliers";
import { mockDelay } from "../lib/mocks/delay";

export interface AddressData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export function useCEPSearch() {
  const [isLoading, setIsLoading] = useState(false);

  const searchCEP = useCallback(async (
    cep: string
  ): Promise<{ success: boolean; data?: AddressData; error?: string }> => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) {
      return { success: false, error: "CEP deve ter 8 dígitos" };
    }

    setIsLoading(true);
    await mockDelay(500);

    const maskedCEP = cleanCEP.replace(/(\d{5})(\d)/, "$1-$2");
    const data = mockCEPData[cep] || mockCEPData[cleanCEP] || mockCEPData[maskedCEP];
    setIsLoading(false);

    if (!data) {
      return {
        success: false,
        error: "CEP não encontrado. Verifique o número digitado.",
      };
    }

    return {
      success: true,
      data: {
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      },
    };
  }, []);

  return { searchCEP, isLoading };
}
