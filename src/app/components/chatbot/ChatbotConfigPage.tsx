/**
 * ChatbotConfigPage - Página de configurações do Chatbot
 * Status, configurações gerais e horário de funcionamento
 * Sprint 12 - UNIQ Empresas
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useChatbotConfig } from '../../hooks/useChatbotConfig';
import { StatusBot } from '../../types/chatbot';
import { Bot, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export function ChatbotConfigPage() {
  const { config, status, atualizarStatus, atualizarConfig } = useChatbotConfig();

  const statusOptions: { value: StatusBot; label: string; description: string }[] = [
    { value: 'online', label: 'Online', description: 'Bot ativo e respondendo automaticamente' },
    { value: 'ocupado', label: 'Ocupado', description: 'Bot atende mas com delay' },
    { value: 'offline', label: 'Offline', description: 'Bot desativado, apenas atendimento humano' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-8 w-8 text-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações do Chatbot</h1>
          <p className="text-muted-foreground">Gerencie o comportamento do assistente virtual</p>
        </div>
      </div>

      {/* Status do Bot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Status do Bot
          </CardTitle>
          <CardDescription>
            Defina se o chatbot está ativo e como ele responde
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => atualizarStatus(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  status === option.value
                    ? 'border-primary bg-muted'
                    : 'border-border hover:border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      option.value === 'online'
                        ? 'bg-green-500'
                        : option.value === 'ocupado'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="font-medium">{option.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription>
            Defina os horários em que o chatbot responde automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario-inicio">Abertura</Label>
              <Input
                id="horario-inicio"
                type="time"
                value={config.horarioFuncionamento.inicio}
                onChange={(e) =>
                  atualizarConfig({
                    horarioFuncionamento: {
                      ...config.horarioFuncionamento,
                      inicio: e.target.value
                    }
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario-fim">Fechamento</Label>
              <Input
                id="horario-fim"
                type="time"
                value={config.horarioFuncionamento.fim}
                onChange={(e) =>
                  atualizarConfig({
                    horarioFuncionamento: {
                      ...config.horarioFuncionamento,
                      fim: e.target.value
                    }
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Responder fora do horário</p>
                <p className="text-sm text-muted-foreground">
                  Enviar mensagem automática quando收到 mensagens fora do horário
                </p>
              </div>
            </div>
            <Switch
              checked={config.responderForaHorario}
              onCheckedChange={(checked) =>
                atualizarConfig({ responderForaHorario: checked })
              }
            />
          </div>

          {config.responderForaHorario && (
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Input
                value={config.msgForaHorario}
                onChange={(e) =>
                  atualizarConfig({ msgForaHorario: e.target.value })
                }
                placeholder="Mensagem exibida fora do horário..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
           Opções adicionais de comportamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Mensagens de boas-vindas</p>
                <p className="text-sm text-muted-foreground">
                  Saudação automática quando nova conversa inicia
                </p>
              </div>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Transferência automática</p>
                <p className="text-sm text-muted-foreground">
                  Encaminhar para atendente humano após X mensagens
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  );
}

export default ChatbotConfigPage;