import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function CardFormDialog({ open, onClose, onSave, initialData, isLoading }) {
  const [formData, setFormData] = useState({
    term: '',
    definition: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        term: initialData.term || '',
        definition: initialData.definition || '',
      });
    } else {
      setFormData({
        term: '',
        definition: '',
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData ? 'Edit Card' : 'Add New Card'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="term">Term *</Label>
            <Textarea
              id="term"
              placeholder="Enter the term or question"
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              required
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition *</Label>
            <Textarea
              id="definition"
              placeholder="Enter the definition or answer"
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.term || !formData.definition || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? 'Save Changes' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}