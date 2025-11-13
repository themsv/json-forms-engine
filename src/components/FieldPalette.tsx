import { useState } from 'react';
import { FIELD_TYPES, WIDGET_TYPES } from '../types/formBuilder';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FieldPaletteProps {
  onDragStart: (fieldType: any) => void;
}

export default function FieldPalette({ onDragStart }: FieldPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Atoms', 'Molecules']));

  const handleDragStart = (e: React.DragEvent, fieldType: any) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
    onDragStart(fieldType);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const fieldCategories = FIELD_TYPES.reduce((acc, field) => {
    const category = field.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, typeof FIELD_TYPES>);

  const widgetCategories = WIDGET_TYPES.reduce((acc, widget) => {
    const category = widget.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(widget);
    return acc;
  }, {} as Record<string, typeof WIDGET_TYPES>);

  const renderFieldItem = (fieldType: any, isWidget: boolean = false) => {
    const IconComponent = (LucideIcons as any)[fieldType.icon];
    return (
      <div
        key={fieldType.id}
        draggable
        onDragStart={(e) => handleDragStart(e, fieldType)}
        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-move transition-all ${
          isWidget
            ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-800/40 hover:border-teal-300 dark:hover:border-teal-600'
            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
        }`}
      >
        {IconComponent && (
          <IconComponent className={`w-4 h-4 ${isWidget ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'}`} />
        )}
        <span className={`text-sm font-medium ${isWidget ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-200'}`}>
          {fieldType.label}
        </span>
      </div>
    );
  };

  const renderCategory = (categoryName: string, items: any[], isWidget: boolean = false) => {
    const isExpanded = expandedCategories.has(categoryName);
    return (
      <div key={categoryName} className="mb-3">
        <button
          onClick={() => toggleCategory(categoryName)}
          className="flex items-center gap-2 w-full text-left mb-2 hover:bg-gray-50 p-1 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            {categoryName}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{items.length}</span>
        </button>
        {isExpanded && (
          <div className="space-y-1.5 ml-2">
            {items.map((item) => renderFieldItem(item, isWidget))}
          </div>
        )}
      </div>
    );
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'Atoms':
        return 'Basic building blocks';
      case 'Molecules':
        return 'Simple component groups';
      case 'Organisms':
        return 'Complex components';
      default:
        return '';
    }
  };

  const renderCategoryWithDescription = (categoryName: string, items: any[], isWidget: boolean = false) => {
    const isExpanded = expandedCategories.has(categoryName);
    const description = getCategoryDescription(categoryName);

    return (
      <div key={categoryName} className="mb-3">
        <button
          onClick={() => toggleCategory(categoryName)}
          className="flex items-start gap-2 w-full text-left mb-2 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
        >
          <div className="mt-0.5">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {categoryName}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{items.length}</span>
            </div>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </button>
        {isExpanded && (
          <div className="space-y-1.5 ml-2">
            {items.map((item) => renderFieldItem(item, isWidget))}
          </div>
        )}
      </div>
    );
  };

  const allCategories = ['Atoms', 'Molecules', 'Organisms'];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <LucideIcons.Component className="w-4 h-4" />
          Atomic Design
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Build forms using design principles</p>
        <div>
          {allCategories.map((category) => {
            const fieldItems = fieldCategories[category] || [];
            const widgetItems = widgetCategories[category] || [];
            const allItems = [...widgetItems, ...fieldItems];

            if (allItems.length === 0) return null;

            return renderCategoryWithDescription(category, allItems, false);
          })}
        </div>
      </div>
    </div>
  );
}
