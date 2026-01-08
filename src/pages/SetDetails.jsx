import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Plus, Play, BookOpen, FileText, 
  MoreVertical, Edit2, Trash2, Layers, Sparkles,
  Upload, Download, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CardFormDialog from '@/components/forms/CardFormDialog';
import SetFormDialog from '@/components/forms/SetFormDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function SetDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('id');

  const [showCardDialog, setShowCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [deleteCard, setDeleteCard] = useState(null);
  const [editingSet, setEditingSet] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: set, isLoading: setLoading } = useQuery({
    queryKey: ['flashcard-set', setId],
    queryFn: async () => {
      const sets = await base44.entities.FlashcardSet.filter({ id: setId });
      return sets[0];
    },
    enabled: !!setId,
  });

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['flashcards', setId],
    queryFn: () => base44.entities.Flashcard.filter({ set_id: setId }, 'order'),
    enabled: !!setId,
  });

  const createCardMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Flashcard.create({ ...data, set_id: setId, order: cards.length });
      await base44.entities.FlashcardSet.update(setId, { card_count: cards.length + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', setId] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
      setShowCardDialog(false);
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Flashcard.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', setId] });
      setEditingCard(null);
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Flashcard.delete(id);
      await base44.entities.FlashcardSet.update(setId, { card_count: Math.max(0, cards.length - 1) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', setId] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
      setDeleteCard(null);
    },
  });

  const updateSetMutation = useMutation({
    mutationFn: (data) => base44.entities.FlashcardSet.update(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
      setEditingSet(null);
    },
  });

  const handleExportCSV = () => {
    const csv = cards.map(card => `"${card.term.replace(/"/g, '""')}","${card.definition.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([`Term,Definition\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set?.title || 'flashcards'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').slice(1); // Skip header
    const newCards = [];

    for (const line of lines) {
      const match = line.match(/^"([^"]*(?:""[^"]*)*)","([^"]*(?:""[^"]*)*)"$/);
      if (match) {
        newCards.push({
          term: match[1].replace(/""/g, '"'),
          definition: match[2].replace(/""/g, '"'),
          set_id: setId,
          order: cards.length + newCards.length,
        });
      }
    }

    if (newCards.length > 0) {
      await base44.entities.Flashcard.bulkCreate(newCards);
      await base44.entities.FlashcardSet.update(setId, { card_count: cards.length + newCards.length });
      queryClient.invalidateQueries({ queryKey: ['flashcards', setId] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
      toast.success(`Imported ${newCards.length} cards`);
    }
  };

  const handleGenerateWithAI = async () => {
    const isPremium = user?.subscription_type === 'monthly' || user?.subscription_type === 'lifetime';
    
    if (!isPremium) {
      toast.error('AI generation is a Premium feature');
      window.location.href = createPageUrl('Pricing');
      return;
    }

    const topic = prompt('Enter a topic to generate flashcards:');
    if (!topic) return;

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 10 flashcards for the topic: "${topic}". Each flashcard should have a term and its definition.`,
        response_json_schema: {
          type: "object",
          properties: {
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  definition: { type: "string" }
                }
              }
            }
          }
        }
      });

      const newCards = result.cards.map((card, i) => ({
        term: card.term,
        definition: card.definition,
        set_id: setId,
        order: cards.length + i,
      }));

      await base44.entities.Flashcard.bulkCreate(newCards);
      await base44.entities.FlashcardSet.update(setId, { card_count: cards.length + newCards.length });
      queryClient.invalidateQueries({ queryKey: ['flashcards', setId] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
      toast.success(`Generated ${newCards.length} cards!`);
    } catch (error) {
      toast.error('Failed to generate cards');
    } finally {
      setIsGenerating(false);
    }
  };

  if (setLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{set?.title}</h1>
              {set?.description && (
                <p className="text-sm text-slate-500">{set.description}</p>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => setEditingSet(set)}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Study Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to={createPageUrl(`StudyFlashcard?id=${setId}`)}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white cursor-pointer"
            >
              <Layers className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg">Flashcards</h3>
              <p className="text-indigo-100 text-sm">Flip through cards</p>
            </motion.div>
          </Link>

          <Link to={createPageUrl(`StudyLearn?id=${setId}`)}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white cursor-pointer"
            >
              <BookOpen className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg">Learn</h3>
              <p className="text-purple-100 text-sm">Type your answers</p>
            </motion.div>
          </Link>

          <Link to={createPageUrl(`StudyTest?id=${setId}`)}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white cursor-pointer"
            >
              <FileText className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg">Test</h3>
              <p className="text-emerald-100 text-sm">Take a practice test</p>
            </motion.div>
          </Link>
        </div>

        {/* Cards Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Cards ({cards.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              AI Generate
            </Button>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              id="import-csv"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-csv').click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            
            <Button variant="outline" onClick={handleExportCSV} disabled={cards.length === 0} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            <Button onClick={() => setShowCardDialog(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" />
              Add Card
            </Button>
          </div>
        </div>

        {/* Cards List */}
        {cardsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl border border-slate-200"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No cards yet</h3>
            <p className="text-slate-500 mb-6">Add your first flashcard or generate with AI</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setShowCardDialog(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" />
                Add Card
              </Button>
              <Button variant="outline" onClick={handleGenerateWithAI} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-500 flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 mb-1 block">Term</span>
                        <p className="text-slate-900">{card.term}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 mb-1 block">Definition</span>
                        <p className="text-slate-700">{card.definition}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingCard(card)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteCard(card)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Card Dialog */}
      <CardFormDialog
        open={showCardDialog || !!editingCard}
        onClose={() => {
          setShowCardDialog(false);
          setEditingCard(null);
        }}
        onSave={(data) => {
          if (editingCard) {
            updateCardMutation.mutate({ id: editingCard.id, data });
          } else {
            createCardMutation.mutate(data);
          }
        }}
        initialData={editingCard}
        isLoading={createCardMutation.isPending || updateCardMutation.isPending}
      />

      {/* Set Edit Dialog */}
      <SetFormDialog
        open={!!editingSet}
        onClose={() => setEditingSet(null)}
        onSave={(data) => updateSetMutation.mutate(data)}
        initialData={editingSet}
        isLoading={updateSetMutation.isPending}
      />

      {/* Delete Card Confirmation */}
      <AlertDialog open={!!deleteCard} onOpenChange={() => setDeleteCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteCardMutation.mutate(deleteCard.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}