/**
 * RespostasAutoPage - Página de Respostas Automáticas
 * Lista e gerenciamento de respostas automáticas do chatbot
 * Sprint 12 - UNIQ Empresas
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useChatbotConfig } from '../../hooks/useChatbotConfig';
import { RespostaAuto } from '../../types/chatbot';
import { Plus, Search, Edit, Trash2, Zap } from 'lucide-react';

export function RespostasAutoPage() {
  const { respostasAuto, adicionarResposta, atualizarResposta, removerResposta } = useChatbotConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResposta, setEditingResposta] = useState<RespostaAuto | null>(null);
  const [formData, setFormData] = useState({
    gatilho: '',
    resposta: '',
    ativa: true,
    delayMs: 1000
  });

  // Filter responses based on search
  const filteredRespostas = respostasAuto.filter(
    (r) =>
      r.gatilho.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.resposta.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (resposta?: RespostaAuto) => {
    if (resposta) {
      setEditingResposta(resposta);
      setFormData({
        gatilho: resposta.gatilho,
        resposta: resposta.resposta,
        ativa: resposta.ativa,
        delayMs: resposta.delayMs
      });
    } else {
      setEditingResposta(null);
      setFormData({
        gatilho: '',
        resposta: '',
        ativa: true,
        delayMs: 1000
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingResposta) {
      atualizarResposta(editingResposta.id, formData);
    } else {
      adicionarResposta(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta resposta?')) {
      removerResposta(id);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Respostas Automáticas</h1>
            <p className="text-muted-foreground">
              Configure respostas automáticas do chatbot
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Resposta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingResposta ? 'Editar Resposta' : 'Nova Resposta Automática'}
              </DialogTitle>
              <DialogDescription>
                Configure quando o chatbot deve responder automaticamente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="gatilho">Gatilho (palavra-chave)</Label>
                <Input
                  id="gatilho"
                  value={formData.gatilho}
                  onChange={(e) =>
                    setFormData({ ...formData, gatilho: e.target.value })
                  }
                  placeholder="ex: ola, preco, help"
                />
                <p className="text-sm text-muted-foreground">
                  Quando o usuário enviar uma mensagem contendo este texto
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resposta">Resposta</Label>
                <Textarea
                  id="resposta"
                  value={formData.resposta}
                  onChange={(e) =>
                    setFormData({ ...formData, resposta: e.target.value })
                  }
                  placeholder="Digite a resposta automática..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={formData.delayMs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        delayMs: parseInt(e.target.value) || 0
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.ativa}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, ativa: checked })
                    }
                  />
                  <Label>Ativa</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingResposta ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por gatilho ou resposta..."
          className="pl-10"
        />
      </div>

      {/* Lista de Respostas */}
      <div className="grid gap-4">
        {filteredRespostas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma resposta encontrada</p>
              <Button
                variant="link"
                onClick={() => handleOpenDialog()}
                className="mt-2"
              >
                Criar primeira resposta
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRespostas.map((resposta) => (
            <Card key={resposta.id} className={!resposta.ativa ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono">
                        {resposta.gatilho}
                      </Badge>
                      <Badge
                        variant={resposta.ativa ? 'default' : 'secondary'}
                      >
                        {resposta.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {resposta.delayMs}ms
                      </span>
                    </div>
                    <p className="text-foreground">{resposta.resposta}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(resposta)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(resposta.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default RespostasAutoPage;