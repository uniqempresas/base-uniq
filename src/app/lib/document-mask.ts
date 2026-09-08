export const maskCNPJ = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);

export const maskCPF = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1-$2")
    .slice(0, 14);

export const maskCEP = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);

export const maskPhone = (value: string) => {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

export const maskDocument = (value: string, type: "cnpj" | "cpf") => {
  if (type === "cnpj") return maskCNPJ(value);
  return maskCPF(value);
};

export const unmask = (value: string) => value.replace(/\D/g, "");
