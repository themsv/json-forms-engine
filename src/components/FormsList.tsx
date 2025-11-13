import { useEffect, useState } from 'react';
import { FileText, Trash2, Calendar } from 'lucide-react';
import { supabase, Form } from '../lib/supabase';

interface FormsListProps {
  onSelectForm: (form: Form) => void;
  onDeleteForm: (formId: string) => void;
  refreshTrigger: number;
}

export default function FormsList({ onSelectForm, onDeleteForm, refreshTrigger }: FormsListProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, [refreshTrigger]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this form?')) {
      try {
        const { error } = await supabase.from('forms').delete().eq('id', formId);
        if (error) throw error;
        onDeleteForm(formId);
        loadForms();
      } catch (error) {
        console.error('Error deleting form:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Saved Forms</h3>
      {forms.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No forms saved yet. Create your first form!
        </p>
      ) : (
        <div className="space-y-2">
          {forms.map((form) => (
            <div
              key={form.id}
              onClick={() => onSelectForm(form)}
              className="group flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 cursor-pointer transition-all"
            >
              <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{form.name || 'Untitled Form'}</h4>
                {form.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{form.description}</p>
                )}
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(form.updated_at)}</span>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, form.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
