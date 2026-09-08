import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCEPSearch } from "../../hooks/useCEPSearch";
import { maskCEP } from "../../lib/document-mask";

interface CEPSearchProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (address: { cep: string; logradouro: string; bairro: string; cidade: string; estado: string }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function CEPSearch({ value, onChange, onAddressFound, onError, disabled }: CEPSearchProps) {
  const { searchCEP, isLoading } = useCEPSearch();
  const [hasError, setHasError] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);
  const lastSearchedRef = useRef<string | null>(null);

  const onAddressFoundRef = useRef(onAddressFound);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onAddressFoundRef.current = onAddressFound;
    onErrorRef.current = onError;
  }, [onAddressFound, onError]);

  const performSearch = useCallback(async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    if (lastSearchedRef.current === clean) return;

    lastSearchedRef.current = clean;
    setHasError(false);
    setHasSuccess(false);

    const result = await searchCEP(clean);
    if (result.success && result.data) {
      setHasSuccess(true);
      onAddressFoundRef.current({
        cep: result.data.cep,
        logradouro: result.data.logradouro,
        bairro: result.data.bairro,
        cidade: result.data.cidade,
        estado: result.data.estado,
      });
    } else {
      setHasError(true);
      onErrorRef.current(result.error || "CEP não encontrado");
    }
  }, [searchCEP]);

  useEffect(() => {
    const clean = value.replace(/\D/g, "");
    if (clean.length === 8) {
      const timer = setTimeout(() => {
        performSearch(clean);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      lastSearchedRef.current = null;
    }
  }, [value, performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    onChange(masked);
    setHasError(false);
    setHasSuccess(false);
    if (masked.replace(/\D/g, "").length !== 8) {
      lastSearchedRef.current = null;
    }
  };

  const handleSearchClick = () => {
    const clean = value.replace(/\D/g, "");
    if (clean.length === 8) {
      lastSearchedRef.current = null;
      performSearch(clean);
    } else {
      setHasError(true);
      onError("CEP deve ter 8 dígitos");
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder="00000-000"
          disabled={disabled}
          className={hasError ? "border-red-300 focus-visible:ring-red-200" : hasSuccess ? "border-[#86cb92] focus-visible:ring-[#86cb92]" : ""}
        />
        {hasSuccess && (
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627271]" size={16} />
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleSearchClick}
        disabled={isLoading || disabled}
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
      </Button>
    </div>
  );
}
