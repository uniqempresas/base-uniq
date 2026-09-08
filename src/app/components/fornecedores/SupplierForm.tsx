import { useState } from "react";
import { useNavigate } from "react-router";
import { Controller } from "react-hook-form";
import { Building2, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SupplierCard } from "./SupplierCard";
import { SupplierRating } from "./SupplierRating";
import { CEPSearch } from "./CEPSearch";
import { ContactList } from "./ContactList";
import { BankAccountList } from "./BankAccountList";
import type { Supplier } from "../../types/suppliers";
import type { SupplierFormData } from "../../lib/validators";
import { useSupplierForm } from "../../hooks/useSupplierForm";
import { mockCategories, BANKS_LIST } from "../../lib/mocks/suppliers";
import { maskDocument, maskPhone, unmask } from "../../lib/document-mask";
import { toast } from "sonner";

interface SupplierFormProps {
  supplier?: Supplier;
  mode: "create" | "edit";
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TABS = [
  { id: "basic", label: "Dados Básicos" },
  { id: "address", label: "Endereço" },
  { id: "contacts", label: "Contatos" },
  { id: "bank", label: "Dados Bancários" },
  { id: "settings", label: "Configurações" },
] as const;

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

export function SupplierForm({ supplier, mode, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("basic");
  const { form, previewData } = useSupplierForm(supplier);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const documentType = watch("documentType");
  const contacts = watch("contacts") || [];
  const bankAccounts = watch("bankAccounts") || [];
  const logo = watch("logo");
  const documentValue = watch("document");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setValue("logo", url, { shouldValidate: false });
    }
  };

  const handleCEPFound = (address: {
    cep: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
  }) => {
    setValue("address.cep", address.cep, { shouldValidate: true });
    setValue("address.street", address.logradouro, { shouldValidate: true });
    setValue("address.neighborhood", address.bairro, { shouldValidate: true });
    setValue("address.city", address.cidade, { shouldValidate: true });
    setValue("address.state", address.estado, { shouldValidate: true });
    toast.success("Endereço encontrado");
  };

  const onFormSubmit = (data: SupplierFormData) => {
    const cleanDoc = unmask(data.document);
    const cleaned = {
      ...data,
      document: cleanDoc,
      contacts: data.contacts.map((c) => ({
        ...c,
        phone: c.phone ? unmask(c.phone) : c.phone,
        mobile: c.mobile ? unmask(c.mobile) : c.mobile,
      })),
    };
    onSubmit(cleaned);
  };

  const currentIndex = TABS.findIndex((t) => t.id === activeTab);
  const goNext = () => {
    if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].id);
  };
  const goPrev = () => {
    if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].id);
  };

  const previewSupplier: Supplier = {
    ...(previewData as Supplier),
    id: supplier?.id || "preview",
    totalPurchases: supplier?.totalPurchases || 0,
    totalSpent: supplier?.totalSpent || 0,
    averageTicket: supplier?.averageTicket || 0,
    lastPurchase: supplier?.lastPurchase || null,
    ratingCount: supplier?.ratingCount || 0,
    createdAt: supplier?.createdAt || new Date().toISOString(),
    updatedAt: supplier?.updatedAt || new Date().toISOString(),
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-[#1f2937] font-bold text-lg">
            {mode === "create" ? "Novo Fornecedor" : "Editar Fornecedor"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#86cb92] hover:bg-[#1f2937] text-[#1f2937] hover:text-white"
          >
            {isLoading ? "Salvando..." : "Salvar Fornecedor"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <TabsList className="bg-[#efefef] border border-[#efefef] p-1 flex-wrap h-auto mb-5">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="text-xs data-[state=active]:bg-white"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basic" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="cnpj" id="tipo-pj" />
                        <Label htmlFor="tipo-pj" className="cursor-pointer">Pessoa Jurídica</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="cpf" id="tipo-pf" />
                        <Label htmlFor="tipo-pf" className="cursor-pointer">Pessoa Física</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">{documentType === "cnpj" ? "CNPJ" : "CPF"} *</Label>
                <Controller
                  name="document"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="document"
                      value={maskDocument(field.value, documentType)}
                      onChange={(e) => {
                        const raw = unmask(e.target.value);
                        field.onChange(raw);
                      }}
                      placeholder={documentType === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
                    />
                  )}
                />
                {errors.document && (
                  <p className="text-xs text-red-500">{errors.document.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalName">Razão Social *</Label>
                <Input id="legalName" {...register("legalName")} placeholder="Razão social" />
                {errors.legalName && (
                  <p className="text-xs text-red-500">{errors.legalName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Fantasia *</Label>
                <Input id="name" {...register("name")} placeholder="Nome fantasia" />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={watch("category")} onValueChange={(v) => setValue("category", v, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-red-500">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="phone"
                        value={field.value ? maskPhone(field.value) : ""}
                        onChange={(e) => field.onChange(unmask(e.target.value))}
                        placeholder="(00) 0000-0000"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avaliação</Label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <SupplierRating
                      value={field.value}
                      onChange={field.onChange}
                      showValue
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-[#efefef] bg-[#efefef] flex items-center justify-center overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={24} className="text-[#627271]" />
                    )}
                  </div>
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1f2937] bg-white border border-[#efefef] rounded-lg hover:bg-[#efefef]"
                  >
                    <Upload size={14} />
                    {logo ? "Alterar logo" : "Enviar logo"}
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {logo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setValue("logo", null)}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>CEP *</Label>
                <Controller
                  name="address.cep"
                  control={control}
                  render={({ field }) => (
                    <CEPSearch
                      value={field.value || ""}
                      onChange={(v: string) => {
                        field.onChange(v);
                      }}
                      onAddressFound={handleCEPFound}
                      onError={(err: string) => toast.error(err)}
                    />
                  )}
                />
                {errors.address?.cep && (
                  <p className="text-xs text-red-500">{errors.address.cep.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Logradouro *</Label>
                  <Input {...register("address.street")} placeholder="Rua, Avenida..." />
                  {errors.address?.street && (
                    <p className="text-xs text-red-500">{errors.address.street.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input {...register("address.number")} placeholder="Nº" />
                  {errors.address?.number && (
                    <p className="text-xs text-red-500">{errors.address.number.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input {...register("address.complement")} placeholder="Sala, andar, bloco..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bairro *</Label>
                  <Input {...register("address.neighborhood")} placeholder="Bairro" />
                  {errors.address?.neighborhood && (
                    <p className="text-xs text-red-500">{errors.address.neighborhood.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input {...register("address.city")} placeholder="Cidade" />
                  {errors.address?.city && (
                    <p className="text-xs text-red-500">{errors.address.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Select value={watch("address.state")} onValueChange={(v) => setValue("address.state", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {UF_LIST.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.address?.state && (
                    <p className="text-xs text-red-500">{errors.address.state.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-0">
              <Controller
                name="contacts"
                control={control}
                render={({ field }) => (
                  <ContactList contacts={field.value || []} onChange={field.onChange} />
                )}
              />
            </TabsContent>

            <TabsContent value="bank" className="mt-0">
              <Controller
                name="bankAccounts"
                control={control}
                render={({ field }) => (
                  <BankAccountList
                    accounts={field.value || []}
                    onChange={field.onChange}
                    supplierDocument={documentValue}
                  />
                )}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>Condição de Pagamento Padrão</Label>
                <Select value={watch("paymentTerms")} onValueChange={(v) => setValue("paymentTerms", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_vista">À vista</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="15/30">15/30 dias</SelectItem>
                    <SelectItem value="21/42">21/42 dias</SelectItem>
                    <SelectItem value="28/56">28/56 dias</SelectItem>
                    <SelectItem value="30/60/90">30/60/90 dias</SelectItem>
                    <SelectItem value="30/60/90/120">30/60/90/120 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observações Internas</Label>
                <Textarea {...register("notes")} rows={4} placeholder="Observações..." />
              </div>

              <div className="flex items-center gap-2">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="ativo"
                      checked={field.value === "active"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "active" : "inactive")
                      }
                    />
                  )}
                />
                <Label htmlFor="ativo" className="cursor-pointer">Fornecedor ativo</Label>
              </div>
            </TabsContent>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#efefef]">
              <Button
                type="button"
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={16} className="mr-1" /> Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={goNext}
                disabled={currentIndex === TABS.length - 1}
              >
                Próxima <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </Tabs>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-4">
            <p className="text-sm font-medium text-[#1f2937] mb-3">Visualização do Card</p>
            <SupplierCard
              supplier={previewSupplier}
              onView={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
