/**
 * Componente ServicoForm - Formulário de cadastro/edição de serviço
 */

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { LucideIcon, Scissors, Sparkles, Upload, X, Image as ImageIcon } from 'lucide-react';
import { DuracaoSelect } from './DuracaoSelect';
import { ProfissionaisSelect } from './ProfissionaisSelect';
import type { Servico, ServicoFormData, CategoriaServico, ServicoStatus, Duracao } from '../../types/servicos';

// Schema de validação Zod
const servicoFormSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  preco: z.number().min(100, 'Preço mínimo é R$ 1,00'),
  duracao: z.number().min(15, 'Duração é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  profissionaisIds: z.array(z.string()),
  status: z.enum(['ativo', 'inativo', 'destaque']),
  destaque: z.boolean(),
});

type ServicoFormValues = z.infer<typeof servicoFormSchema>;

// Opções de categorias
const categorias: { value: CategoriaServico; label: string; icon: LucideIcon }[] = [
  { value: 'cabelo', label: 'Cabelo', icon: Scissors },
  { value: 'unhas', label: 'Unhas', icon: Scissors },
  { value: 'estetica', label: 'Estética', icon: Sparkles },
  { value: 'massagem', label: 'Massagem', icon: Sparkles },
  { value: 'barba', label: 'Barba', icon: Scissors },
];

// Opções de status
const statuses: { value: ServicoStatus; label: string; description: string }[] = [
  { value: 'ativo', label: 'Ativo', description: 'Serviço disponível para agendamento' },
  { value: 'inativo', label: 'Inativo', description: 'Serviço temporariamente indisponível' },
  { value: 'destaque', label: 'Destaque', description: 'Serviço em destaque no catálogo' },
];

interface ServicoFormProps {
  servicoId?: string;
  initialData?: Partial<Servico>;
  onSuccess: (data: ServicoFormData) => void;
  onCancel: () => void;
}

export function ServicoForm({ servicoId, initialData, onSuccess, onCancel }: ServicoFormProps) {
  const [imagemPreview, setImagemPreview] = useState<string | null>(initialData?.imagemUrl || null);
  const [isImagemLoading, setIsImagemLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar formulário
  const form = useForm<ServicoFormValues>({
    resolver: zodResolver(servicoFormSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      preco: initialData?.preco || 0,
      duracao: initialData?.duracao || 30,
      categoria: initialData?.categoria || 'cabelo',
      profissionaisIds: initialData?.profissionaisIds ?? [],
      status: initialData?.status || 'ativo',
      destaque: initialData?.destaque ?? false,
    },
    mode: 'onBlur',
  });

  // Observar mudanças para atualização de destaque automático
  const status = form.watch('status');

  // Atualizar destaque automaticamente quando status for "destaque"
  useEffect(() => {
    if (status === 'destaque') {
      form.setValue('destaque', true);
    } else {
      form.setValue('destaque', false);
    }
  }, [status, form]);

  // Processar valor do preço (de BRL para centavos)
  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remover caracteres não numéricos
    const numericValue = value.replace(/[^\d]/g, '');
    // Converter para centavos
    const centavos = numericValue ? parseInt(numericValue) : 0;
    form.setValue('preco', centavos);
  };

  // Formatar preço para display
  const formatPrecoDisplay = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  // Handle de upload de imagem
  const handleImagemClick = () => {
    fileInputRef.current?.click();
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImagemLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
        setIsImagemLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverImagem = () => {
    setImagemPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit do formulário
  const onSubmit = (data: ServicoFormValues) => {
    const formData: ServicoFormData = {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      duracao: data.duracao as Duracao,
      categoria: data.categoria as CategoriaServico,
      profissionaisIds: data.profissionaisIds,
      status: data.status,
      destaque: data.destaque,
    };

    // Adicionar URL da imagem se existir
    if (imagemPreview && !imagemPreview.startsWith('http')) {
      // Apenas para demo - em produção faria upload para storage
    }

    onSuccess(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Informações principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Serviço</CardTitle>
                <CardDescription>
                  {servicoId ? 'Edite os dados do serviço' : 'Preencha os dados do novo serviço'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Serviço *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Corte Feminino" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o serviço incluindo o que está incluído..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Linha com Preço e Duração */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preço */}
                  <FormField
                    control={form.control}
                    name="preco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="R$ 0,00"
                            defaultValue={field.value ? formatPrecoDisplay(field.value) : ''}
                            onChange={handlePrecoChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor em centavos (ex: R$ 100,00 = 10000)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duração */}
                  <FormField
                    control={form.control}
                    name="duracao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração *</FormLabel>
                        <FormControl>
                          <DuracaoSelect
                            value={field.value as Duracao}
                            onChange={(value) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Categoria */}
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card de Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle>Profissionais</CardTitle>
                <CardDescription>
                  Selecione os profissionais que podem realizar este serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="profissionaisIds"
                  render={({ field }) => (
                    <FormItem>
                      <ProfissionaisSelect
                        value={field.value}
                        onChange={field.onChange}
                        label="Colaboradores"
                      />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Status e Imagem */}
          <div className="space-y-6">
            {/* Card de Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Defina a disponibilidade do serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-col space-y-1"
                        >
                          {statuses.map((status) => (
                            <FormItem
                              key={status.value}
                              className="flex items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-[#efefef] transition-colors"
                            >
                              <FormControl>
                                <RadioGroupItem value={status.value} />
                              </FormControl>
                              <FormLabel className="flex-1 cursor-pointer">
                                <div className="font-medium">{status.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {status.description}
                                </div>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card de Imagem */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem</CardTitle>
                <CardDescription>
                  Adicione uma imagem para o serviço (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImagemChange}
                />

                {imagemPreview ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={imagemPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoverImagem}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleImagemClick}
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-[#efefef] hover:border-[#efefef] flex flex-col items-center justify-center gap-2 transition-colors"
                    disabled={isImagemLoading}
                  >
                    {isImagemLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#627271]" />
                        <span className="text-sm text-[#627271]">
                          Clique para adicionar imagem
                        </span>
                      </>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações do formulário */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {servicoId ? 'Salvar Alterações' : 'Criar Serviço'}
          </Button>
        </div>
      </form>
    </Form>
  );
}