// Rota sugerida: /onboarding/plano (ou /meus-modulos/planos)

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

const PLANOS = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 0,
    descricao: 'Ideal para começar e organizar seu negócio.',
    modulos: ['Dashboard', 'Minha Empresa', 'Configurações'],
    destaque: false,
  },
  {
    id: 'business',
    nome: 'Business',
    preco: 149,
    descricao: 'O mais escolhido por salões e clínicas em crescimento.',
    modulos: [
      'Dashboard',
      'Minha Empresa',
      'Configurações',
      'CRM',
      'Estoque',
      'Vendas',
      'Agenda',
      'Financeiro',
      'Métricas',
      'Catálogo de Serviços',
      'Colaboradores',
    ],
    destaque: true,
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 299,
    descricao: 'Potência total com todos os módulos e recursos premium.',
    modulos: ['Todos os módulos disponíveis'],
    destaque: false,
  },
];

function Stepper() {
  return (
    <div className="mb-8 flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
          1
        </div>
        <span className="hidden text-sm text-muted-foreground sm:inline">Cadastro</span>
      </div>
      <div className="h-px w-8 bg-border" />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          2
        </div>
        <span className="hidden text-sm font-medium sm:inline">Plano</span>
      </div>
      <div className="h-px w-8 bg-border" />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
          3
        </div>
        <span className="hidden text-sm text-muted-foreground sm:inline">Começar</span>
      </div>
    </div>
  );
}

export function EscolhaPlanoPage() {
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const handleEscolher = (planoId: string) => {
    setSelecionado(planoId);
    const plano = PLANOS.find((p) => p.id === planoId);
    if (plano) {
      toast.success(`Plano ${plano.nome} selecionado com sucesso!`);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold">Escolha seu plano</h1>
        <p className="mt-2 text-muted-foreground">
          Selecione o melhor plano para sua empresa. Você pode mudar a qualquer momento.
        </p>
      </div>

      <Stepper />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {PLANOS.map((plano) => (
          <Card
            key={plano.id}
            className={`relative flex flex-col ${
              plano.destaque ? 'border-primary shadow-lg' : ''
            }`}
          >
            {plano.destaque && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Mais popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plano.nome}</CardTitle>
              <CardDescription>{plano.descricao}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ {plano.preco}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <Separator className="mb-4" />
              <ul className="space-y-3">
                {plano.modulos.map((mod, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 text-foreground" />
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                variant={plano.destaque ? 'default' : 'outline'}
                onClick={() => handleEscolher(plano.id)}
              >
                {selecionado === plano.id ? 'Selecionado' : `Escolher ${plano.nome}`}
                {selecionado === plano.id && <Sparkles className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Button variant="link" className="mt-8" onClick={() => handleEscolher('starter')}>
        Quero começar só com o gratuito e escolher depois
      </Button>
    </div>
  );
}

export default EscolhaPlanoPage;
