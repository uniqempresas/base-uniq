/**
 * ChatbotStatsPage - Página de Estatísticas do Chatbot
 * Métricas: conversas, mensagens, tempo médio, satisfação
 * Sprint 12 - UNIQ Empresas
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useChatbot } from '../../hooks/useChatbot';
import { useChatbotConfig } from '../../hooks/useChatbotConfig';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  ThumbsUp, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react';

export function ChatbotStatsPage() {
  const { conversas } = useChatbot();
  const { respostasAuto } = useChatbotConfig();

  // Calculate statistics
  const totalConversas = conversas.length;
  const conversasAtivas = conversas.filter(c => c.status === 'ativa').length;
  const conversasEncerradas = conversas.filter(c => c.status === 'encerrada').length;
  const mensagensNaoLidas = conversas.reduce((acc, c) => acc + c.naoLidas, 0);
  const respostasConfiguradas = respostasAuto.length;

  // Mock metrics (these would come from actual analytics)
  const metricas = {
    mensagensHoje: 47,
    mensagensSemana: 312,
    mensagensMes: 1247,
    tempoMedioResposta: '2.3 min',
    satisfacao: 4.5,
    totalAvaliacoes: 89,
    conversoesEncerradas: conversasEncerradas,
    taxaRespostaAuto: 68 // percentage
  };

  const cards = [
    {
      title: 'Conversas',
      value: totalConversas,
      subvalue: `${conversasAtivas} ativas`,
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Mensagens Hoje',
      value: metricas.mensagensHoje,
      subvalue: `+${Math.round(metricas.mensagensHoje * 0.3)} vs ontem`,
      icon: Activity,
      color: 'text-foreground',
      bgColor: 'bg-muted'
    },
    {
      title: 'Tempo Médio',
      value: metricas.tempoMedioResposta,
      subvalue: 'para primeira resposta',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Satisfação',
      value: `${metricas.satisfacao}/5`,
      subvalue: `${metricas.totalAvaliacoes} avaliações`,
      icon: ThumbsUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estatísticas do Chatbot</h1>
          <p className="text-muted-foreground">Métricas e performance do assistente virtual</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="text-xs text-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.subvalue}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mensagens por Dia</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { dia: 'Hoje', mensagens: 47 },
                { dia: 'Ontem', mensagens: 52 },
                { dia: 'Terça', mensagens: 45 },
                { dia: 'Quarta', mensagens: 61 },
                { dia: 'Quinta', mensagens: 58 },
                { dia: 'Sexta', mensagens: 49 },
                { dia: 'Sábado', mensagens: 0 }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-16">{item.dia}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${(item.mensagens / 70) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8">
                    {item.mensagens}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas de Performance</CardTitle>
            <CardDescription>Resumo do período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Total Mensagens</span>
              </div>
              <span className="text-lg font-bold">{metricas.mensagensMes}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Taxa Resposta Auto</span>
              </div>
              <span className="text-lg font-bold">{metricas.taxaRespostaAuto}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Conversas Encerradas</span>
              </div>
              <span className="text-lg font-bold">{metricas.conversoesEncerradas}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Tempo Médio Resposta</span>
              </div>
              <span className="text-lg font-bold">{metricas.tempoMedioResposta}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Satisfação</span>
              </div>
              <span className="text-lg font-bold">{metricas.satisfacao}/5</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Palavras mais frequentes</CardTitle>
          <CardDescription>Topics mais discutidos nas conversas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { palavra: 'planos', count: 45 },
              { palavra: 'preço', count: 38 },
              { palavra: 'suporte', count: 32 },
              { palavra: 'horário', count: 28 },
              { palavra: 'CRM', count: 25 },
              { palavra: 'implementação', count: 22 },
              { palavra: 'teste', count: 19 },
              { palavra: 'contato', count: 17 },
              { palavra: 'atendimento', count: 15 },
              { palavra: 'proposta', count: 12 }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
              >
                <span className="text-sm font-medium">{item.palavra}</span>
                <span className="text-xs text-muted-foreground">({item.count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatbotStatsPage;