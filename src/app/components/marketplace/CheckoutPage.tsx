/**
 * CheckoutPage - Página de checkout do marketplace
 * Formulário de dados do cliente, endereço, resumo do pedido e pagamento
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { useCarrinho } from '../../hooks/useCarrinho';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Formata preço em centavos para display (R$)
 */
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

interface ClienteData {
  nome: string;
  email: string;
  telefone: string;
}

interface EnderecoData {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { itensAgrupados, subtotalGeral, freightGeral, valorTotal, limparCarrinho } = useCarrinho();
  
  const [etapa, setEtapa] = useState<'dados' | 'pagamento' | 'sucesso'>('dados');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const [clienteData, setClienteData] = useState<ClienteData>({
    nome: '',
    email: '',
    telefone: '',
  });
  
  const [enderecoData, setEnderecoData] = useState<EnderecoData>({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  });
  
  const [formaPagamento, setFormaPagamento] = useState('pix');

  const temItens = itensAgrupados.length > 0;

  // Validar dados do cliente
  const validarDadosCliente = () => {
    if (!clienteData.nome.trim()) return 'Nome é obrigatório';
    if (!clienteData.email.trim()) return 'Email é obrigatório';
    if (!clienteData.email.includes('@')) return 'Email inválido';
    if (!clienteData.telefone.trim()) return 'Telefone é obrigatório';
    return null;
  };

  // Validar endereço
  const validarEndereco = () => {
    if (!enderecoData.logradouro.trim()) return 'Logradouro é obrigatório';
    if (!enderecoData.numero.trim()) return 'Número é obrigatório';
    if (!enderecoData.bairro.trim()) return 'Bairro é obrigatório';
    if (!enderecoData.cidade.trim()) return 'Cidade é obrigatória';
    if (!enderecoData.estado.trim()) return 'Estado é obrigatório';
    if (!enderecoData.cep.trim()) return 'CEP é obrigatório';
    return null;
  };

  // Continuar para pagamento
  const handleContinuar = () => {
    const erroValidacao = validarDadosCliente();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    
    setErro(null);
    setEtapa('pagamento');
  };

  // Finalizar compra
  const handleFinalizar = async () => {
    const erroValidacao = validarEndereco();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    
    setErro(null);
    setProcessando(true);
    
    // Simular processamento (2 segundos)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setProcessando(false);
    limparCarrinho();
    setEtapa('sucesso');
  };

  // Página de sucesso
  if (etapa === 'sucesso') {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <CheckCircle className="h-12 w-12 text-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Pedido Realizado!</h2>
            <p className="mb-4 text-muted-foreground">
              Seu pedido foi confirmado com sucesso. Você receberá um email com os detalhes.
            </p>
            <p className="text-lg font-semibold">Total: {formatPrice(valorTotal)}</p>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button className="w-full" onClick={() => navigate('/marketplace')}>
              Voltar ao Marketplace
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/loja/pedidos')}>
              Meus Pedidos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!temItens) {
    return (
      <div className="container mx-auto py-6">
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
            <Button onClick={() => navigate('/marketplace')} className="mt-4">
              Ver Produtos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Botão Voltar */}
      {etapa !== 'sucesso' && (
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => navigate('/marketplace/carrinho')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Carrinho
        </Button>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Etapa 1: Dados do Cliente */}
          {etapa === 'dados' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    1
                  </div>
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {erro && (
                  <Alert variant="destructive">
                    <AlertDescription>{erro}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input
                      id="nome"
                      placeholder="Seu nome"
                      value={clienteData.nome}
                      onChange={(e) => setClienteData({ ...clienteData, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={clienteData.email}
                      onChange={(e) => setClienteData({ ...clienteData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      value={clienteData.telefone}
                      onChange={(e) => setClienteData({ ...clienteData, telefone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto" onClick={handleContinuar}>
                  Continuar
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Etapa 2: Endereço e Pagamento */}
          {etapa === 'pagamento' && (
            <>
              {/* Endereço */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      2
                    </div>
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {erro && (
                    <Alert variant="destructive">
                      <AlertDescription>{erro}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="logradouro">Logradouro *</Label>
                      <Input
                        id="logradouro"
                        placeholder="Rua, Av, etc"
                        value={enderecoData.logradouro}
                        onChange={(e) => setEnderecoData({ ...enderecoData, logradouro: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número *</Label>
                      <Input
                        id="numero"
                        placeholder="123"
                        value={enderecoData.numero}
                        onChange={(e) => setEnderecoData({ ...enderecoData, numero: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        placeholder="Apto, Bloco, etc"
                        value={enderecoData.complemento}
                        onChange={(e) => setEnderecoData({ ...enderecoData, complemento: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro *</Label>
                      <Input
                        id="bairro"
                        placeholder="Bairro"
                        value={enderecoData.bairro}
                        onChange={(e) => setEnderecoData({ ...enderecoData, bairro: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={enderecoData.cep}
                        onChange={(e) => setEnderecoData({ ...enderecoData, cep: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input
                        id="cidade"
                        placeholder="Cidade"
                        value={enderecoData.cidade}
                        onChange={(e) => setEnderecoData({ ...enderecoData, cidade: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado *</Label>
                      <Input
                        id="estado"
                        placeholder="UF"
                        value={enderecoData.estado}
                        onChange={(e) => setEnderecoData({ ...enderecoData, estado: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Forma de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      3
                    </div>
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formaPagamento}
                    onValueChange={setFormaPagamento}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex-1 cursor-pointer">
                        PIX (à vista - 10%off)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="cartao_credito" id="cartao_credito" />
                      <Label htmlFor="cartao_credito" className="flex-1 cursor-pointer">
                        Cartão de Crédito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="cartao_debito" id="cartao_debito" />
                      <Label htmlFor="cartao_debito" className="flex-1 cursor-pointer">
                        Cartão de Débito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                        Boleto Bancário
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={() => setEtapa('dados')}>
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleFinalizar}
                    disabled={processando}
                    className="gap-2"
                  >
                    {processando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Finalizar Compra
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>

        {/* Resumo do Pedido */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Itens por lojista */}
              {itensAgrupados.map((grupo) => (
                <div key={grupo.lojista.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{grupo.lojista.nome}</span>
                  </div>
                  {grupo.itens.map((item) => (
                    <div key={item.produtoId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantidade}x {item.produto.nome}
                      </span>
                      <span>
                        {formatPrice((item.produto.precoPromocional || item.produto.preco) * item.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              <Separator />

              {/* Totais */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotalGeral)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span>{freightGeral > 0 ? formatPrice(freightGeral) : 'Grátis'}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(valorTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;