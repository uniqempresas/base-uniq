/**
 * FAQPage - Página de FAQs (Perguntas Frequentes)
 * Editor de FAQs com ordenação e ativação/desativação
 * Sprint 12 - UNIQ Empresas
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { useChatbotConfig } from '../../hooks/useChatbotConfig';
import { FAQItem } from '../../types/chatbot';
import { Plus, HelpCircle, GripVertical, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export function FAQPage() {
  const { faqs, adicionarFAQ, atualizarFAQ, removerFAQ, reorderFAQs } = useChatbotConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    pergunta: '',
    resposta: '',
    ordem: 0
  });

  // Handle reorder - move up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFaqs = [...faqs];
    const temp = newFaqs[index - 1];
    newFaqs[index - 1] = newFaqs[index];
    newFaqs[index] = temp;
    reorderFAQs(newFaqs);
  };

  // Handle reorder - move down
  const handleMoveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    const newFaqs = [...faqs];
    const temp = newFaqs[index];
    newFaqs[index] = newFaqs[index + 1];
    newFaqs[index + 1] = temp;
    reorderFAQs(newFaqs);
  };

  const handleOpenDialog = (faq?: FAQItem) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        pergunta: faq.pergunta,
        resposta: faq.resposta,
        ordem: faq.ordem
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        pergunta: '',
        resposta: '',
        ordem: faqs.length + 1
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingFAQ) {
      atualizarFAQ(editingFAQ.id, formData);
    } else {
      adicionarFAQ(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta FAQ?')) {
      removerFAQ(id);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Perguntas Frequentes</h1>
            <p className="text-muted-foreground">
              Configure as FAQs do chatbot
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Editar FAQ' : 'Nova FAQ'}
              </DialogTitle>
              <DialogDescription>
                Adicione uma pergunta frequente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pergunta">Pergunta</Label>
                <Input
                  id="pergunta"
                  value={formData.pergunta}
                  onChange={(e) =>
                    setFormData({ ...formData, pergunta: e.target.value })
                  }
                  placeholder="Qual é o prazo de implementação?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resposta">Resposta</Label>
                <Textarea
                  id="resposta"
                  value={formData.resposta}
                  onChange={(e) =>
                    setFormData({ ...formData, resposta: e.target.value })
                  }
                  placeholder="Digite a resposta..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingFAQ ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de FAQs */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma FAQ encontrada</p>
              <Button
                variant="link"
                onClick={() => handleOpenDialog()}
                className="mt-2"
              >
                Criar primeira FAQ
              </Button>
            </CardContent>
          </Card>
        ) : (
          faqs
            .sort((a, b) => a.ordem - b.ordem)
            .map((faq, index) => (
              <Card key={faq.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Order controls */}
                    <div className="flex flex-col gap-1 pt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === faqs.length - 1}
                        onClick={() => handleMoveDown(index)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{faq.ordem}</Badge>
                        <span className="font-medium">{faq.pergunta}</span>
                      </div>
                      <p className="text-foreground text-sm">{faq.resposta}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(faq.id)}
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

export default FAQPage;