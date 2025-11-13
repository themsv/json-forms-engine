import { FIELD_TYPES, WIDGET_TYPES } from '../types/formBuilder';
import * as LucideIcons from 'lucide-react';

interface FieldPaletteProps {
  onDragStart: (fieldType: any) => void;
}

export default function FieldPalette({ onDragStart }: FieldPaletteProps) {
  const handleDragStart = (e: React.DragEvent, fieldType: any) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
    onDragStart(fieldType);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Widgets</h3>
        <div className="space-y-2">
          {WIDGET_TYPES.map((widgetType) => {
            const IconComponent = (LucideIcons as any)[widgetType.icon];
            return (
              <div
                key={widgetType.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widgetType)}
                className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200 cursor-move hover:bg-teal-100 hover:border-teal-300 transition-all"
              >
                {IconComponent && <IconComponent className="w-4 h-4 text-teal-600" />}
                <span className="text-sm font-medium text-teal-700">{widgetType.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Fields</h3>
        <div className="space-y-2">
          {FIELD_TYPES.map((fieldType) => {
            const IconComponent = (LucideIcons as any)[fieldType.icon];
            return (
              <div
                key={fieldType.id}
                draggable
                onDragStart={(e) => handleDragStart(e, fieldType)}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                {IconComponent && <IconComponent className="w-4 h-4 text-gray-600" />}
                <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
