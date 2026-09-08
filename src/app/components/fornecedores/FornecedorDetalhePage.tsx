import { ArrowLeft, Building2, Edit2, MapPin, Phone, Power, ShoppingBag, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../ui/button";
import { useSuppliers } from "../../hooks/useSuppliers";
import type { Supplier } from "../../types/suppliers";

const statusLabels: Record<Supplier["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Em análise",
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function DetailCard({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section data-od-id={id} className="rounded-[8px] border border-[#efefef] bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1f2937]">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#efefef] py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-[#627271]">{label}</dt>
      <dd className="text-sm font-medium text-[#1f2937] sm:text-right">{value || "Não informado"}</dd>
    </div>
  );
}

export function FornecedorDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { suppliers, isLoading, updateSupplier } = useSuppliers();

  const supplier = suppliers.find((s) => s.id === id);

  if (isLoading && !supplier) {
    return (
      <main data-od-id="fornecedor-detalhe-regiao" className="min-h-full bg-[#fafafa] p-4 sm:p-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-8 w-40 rounded-[8px] bg-[#efefef]" />
          <div className="h-36 rounded-[8px] bg-white" />
          <div className="grid gap-5 lg:grid-cols-2"><div className="h-52 rounded-[8px] bg-white" /><div className="h-52 rounded-[8px] bg-white" /></div>
        </div>
      </main>
    );
  }

  if (!supplier) {
    return (
      <main data-od-id="fornecedor-detalhe-regiao" className="flex min-h-full items-center justify-center bg-[#fafafa] p-6">
        <div className="max-w-md rounded-[8px] border border-[#efefef] bg-white p-8 text-center shadow-sm">
          <h1 data-od-id="fornecedor-nao-encontrado-heading" className="text-xl font-semibold text-[#1f2937]">Fornecedor não encontrado</h1>
          <p className="mt-2 text-sm text-[#627271]">O fornecedor solicitado não está disponível.</p>
          <Button data-od-id="fornecedor-nao-encontrado-acao" className="mt-6" onClick={() => navigate("/fornecedores")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para fornecedores
          </Button>
        </div>
      </main>
    );
  }

  const handleToggleStatus = async () => {
    await updateSupplier(supplier.id, { status: supplier.status === "active" ? "inactive" : "active" });
  };

  const address = supplier.address;
  const allContacts = supplier.contacts.length ? supplier.contacts : [];

  return (
    <main data-od-id="fornecedor-detalhe-regiao" className="min-h-full bg-[#fafafa] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div data-od-id="fornecedor-detalhe-heading" className="flex flex-col gap-4">
          <button type="button" className="flex w-fit items-center gap-2 text-sm font-medium text-[#627271] transition-colors hover:text-[#1f2937]" onClick={() => navigate("/fornecedores")}>
            <ArrowLeft className="h-4 w-4" /> Voltar para fornecedores
          </button>
          <div className="flex flex-col justify-between gap-5 rounded-[8px] border border-[#efefef] bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#efefef] text-lg font-bold text-[#1f2937]">
                {supplier.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 data-od-id="fornecedor-detalhe-titulo" className="text-2xl font-semibold tracking-tight text-[#1f2937]">{supplier.name}</h1>
                <p className="mt-1 text-sm text-[#627271]">{supplier.legalName}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#627271]">
                  <span>{supplier.documentType === "cnpj" ? "CNPJ" : "CPF"}: {supplier.document}</span>
                  <span className="text-[#efefef]">•</span>
                  <span className="rounded-[8px] border border-[#efefef] bg-[#fafafa] px-2.5 py-1 font-medium text-[#1f2937]">{statusLabels[supplier.status]}</span>
                </div>
              </div>
            </div>
            <div data-od-id="fornecedor-detalhe-acoes" className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-[8px]" onClick={() => navigate(`/fornecedores/${supplier.id}/editar`)}>
                <Edit2 className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button variant="outline" className="rounded-[8px]" onClick={handleToggleStatus} disabled={isLoading}>
                <Power className="mr-2 h-4 w-4" /> {supplier.status === "active" ? "Inativar" : "Ativar"}
              </Button>
            </div>
          </div>
        </div>

        <div data-od-id="fornecedor-detalhe-cards" className="grid gap-5 lg:grid-cols-2">
          <DetailCard id="fornecedor-contato-card" title="Contato" icon={<Phone className="h-4 w-4 text-[#627271]" />}>
            <dl>
              <InfoRow label="E-mail geral" value={supplier.email && <a className="hover:underline" href={`mailto:${supplier.email}`}>{supplier.email}</a>} />
              <InfoRow label="Telefone" value={supplier.phone && <a className="hover:underline" href={`tel:${supplier.phone}`}>{supplier.phone}</a>} />
            </dl>
            {allContacts.length > 0 && (
              <div className="mt-4 border-t border-[#efefef] pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#627271]">Pessoas de contato</p>
                <div className="space-y-3">{allContacts.map((contact) => <div key={contact.id} className="text-sm"><p className="font-medium text-[#1f2937]">{contact.name}{contact.isPrimary ? " · Principal" : ""}</p><p className="text-[#627271]">{contact.role || "Contato"}{contact.email ? ` · ${contact.email}` : ""}{contact.mobile || contact.phone ? ` · ${contact.mobile || contact.phone}` : ""}</p></div>)}</div>
              </div>
            )}
          </DetailCard>

          <DetailCard id="fornecedor-endereco-card" title="Endereço" icon={<MapPin className="h-4 w-4 text-[#627271]" />}>
            <address className="not-italic text-sm leading-6 text-[#1f2937]">{address.street}, {address.number}{address.complement ? ` — ${address.complement}` : ""}<br />{address.neighborhood}<br />{address.city}/{address.state} · CEP {address.cep}</address>
          </DetailCard>

          <DetailCard id="fornecedor-comercial-card" title="Dados comerciais" icon={<Building2 className="h-4 w-4 text-[#627271]" />}>
            <dl>
              <InfoRow label="Categoria" value={supplier.category} />
              <InfoRow label="Condição de pagamento" value={supplier.paymentTerms} />
              <InfoRow label="Contas bancárias" value={`${supplier.bankAccounts.length} cadastrada(s)`} />
            </dl>
            {supplier.bankAccounts.length > 0 && <div className="mt-3 space-y-2 text-sm text-[#627271]">{supplier.bankAccounts.map((account) => <p key={account.id}><span className="font-medium text-[#1f2937]">{account.bankName}</span> · Ag. {account.agency} · Conta {account.account}</p>)}</div>}
          </DetailCard>

          <DetailCard id="fornecedor-resumo-card" title="Resumo de compras e gastos" icon={<ShoppingBag className="h-4 w-4 text-[#627271]" />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[8px] bg-[#fafafa] p-3"><p className="text-xs text-[#627271]">Compras</p><p className="mt-1 text-xl font-semibold text-[#1f2937]">{supplier.totalPurchases}</p></div>
              <div className="rounded-[8px] bg-[#fafafa] p-3"><p className="text-xs text-[#627271]">Total gasto</p><p className="mt-1 text-xl font-semibold text-[#1f2937]">{currency.format(supplier.totalSpent)}</p></div>
              <div className="rounded-[8px] bg-[#fafafa] p-3"><p className="text-xs text-[#627271]">Ticket médio</p><p className="mt-1 text-lg font-semibold text-[#1f2937]">{currency.format(supplier.averageTicket)}</p></div>
              <div className="rounded-[8px] bg-[#fafafa] p-3"><p className="text-xs text-[#627271]">Última compra</p><p className="mt-1 text-sm font-semibold text-[#1f2937]">{supplier.lastPurchase ? new Intl.DateTimeFormat("pt-BR").format(new Date(supplier.lastPurchase)) : "Nenhuma"}</p></div>
            </div>
          </DetailCard>
        </div>

        {supplier.notes && <DetailCard id="fornecedor-observacoes-card" title="Observações" icon={<Wallet className="h-4 w-4 text-[#627271]" />}><p className="whitespace-pre-wrap text-sm leading-6 text-[#627271]">{supplier.notes}</p></DetailCard>}
      </div>
    </main>
  );
}
