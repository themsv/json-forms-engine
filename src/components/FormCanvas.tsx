import { useState, useEffect } from 'react';
import { Trash2, GripVertical, Settings, Eye, Lock, Plus, Maximize2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { FIELD_TYPES, WIDGET_TYPES, FormField, FieldSize } from '../types/formBuilder';

interface FormCanvasProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  onFieldSelect: (field: FormField | null) => void;
  selectedField: FormField | null;
}

export default function FormCanvas({
  fields,
  onFieldsChange,
  onFieldSelect,
  selectedField,
}: FormCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverContainer, setDragOverContainer] = useState<string | null>(null);
  const [dragOverDropZone, setDragOverDropZone] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent, containerId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fieldTypeData = e.dataTransfer.getData('fieldType');
    const existingFieldData = e.dataTransfer.getData('existingField');

    if (fieldTypeData) {
      const fieldType = JSON.parse(fieldTypeData);
      const newField: FormField = {
        id: `field_${Date.now()}`,
        name: `field_${fields.length + 1}`,
        label: fieldType.defaultConfig.title || fieldType.label,
        type: fieldType.type,
        required: false,
        config: { ...fieldType.defaultConfig },
        isContainer: fieldType.type === 'container',
        children: fieldType.type === 'container' ? [] : undefined,
      };

      if (containerId) {
        const updatedFields = addFieldToContainer(fields, containerId, newField);
        onFieldsChange(updatedFields);
      } else {
        onFieldsChange([...fields, newField]);
      }
    } else if (existingFieldData) {
      const { fieldId, sourceIndex, sourceContainerId } = JSON.parse(existingFieldData);

      if (sourceContainerId) {
        const field = findFieldInContainer(fields, sourceContainerId, fieldId);
        if (field) {
          let newFields = removeFieldFromContainer(fields, sourceContainerId, fieldId);
          if (containerId) {
            newFields = addFieldToContainer(newFields, containerId, field);
          } else {
            newFields = [...newFields, field];
          }
          onFieldsChange(newFields);
        }
      } else {
        const field = fields[sourceIndex];
        let newFields = [...fields];
        newFields.splice(sourceIndex, 1);

        if (containerId) {
          newFields = addFieldToContainer(newFields, containerId, field);
        } else {
          const targetIndex = dragOverIndex !== null ? dragOverIndex : newFields.length;
          newFields.splice(targetIndex, 0, field);
        }
        onFieldsChange(newFields);
      }
    }

    setDragOverIndex(null);
    setDragOverContainer(null);
  };

  const findFieldInContainer = (fields: FormField[], containerId: string, fieldId: string): FormField | null => {
    for (const field of fields) {
      if (field.id === containerId && field.children) {
        const found = field.children.find(c => c.id === fieldId);
        if (found) return found;
      }
    }
    return null;
  };

  const addFieldToContainer = (fields: FormField[], containerId: string, newField: FormField): FormField[] => {
    return fields.map(field => {
      if (field.id === containerId && field.isContainer) {
        return {
          ...field,
          children: [...(field.children || []), newField],
        };
      }
      return field;
    });
  };

  const removeFieldFromContainer = (fields: FormField[], containerId: string, fieldId: string): FormField[] => {
    return fields.map(field => {
      if (field.id === containerId && field.isContainer && field.children) {
        return {
          ...field,
          children: field.children.filter(c => c.id !== fieldId),
        };
      }
      return field;
    });
  };

  const handleDragOver = (e: React.DragEvent, index?: number, containerId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const existingFieldData = e.dataTransfer.types.includes('existingfield');
    e.dataTransfer.dropEffect = existingFieldData ? 'move' : 'copy';

    if (containerId) {
      setDragOverContainer(containerId);
    } else if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverIndex(null);
    setDragOverContainer(null);
  };

  const handleFieldDragStart = (e: React.DragEvent, field: FormField, index: number, containerId?: string) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'existingField',
      JSON.stringify({ fieldId: field.id, sourceIndex: index, sourceContainerId: containerId })
    );
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onFieldsChange(newFields);
    if (selectedField && fields[index].id === selectedField.id) {
      onFieldSelect(null);
    }
  };

  const removeChildField = (containerId: string, childId: string) => {
    const newFields = removeFieldFromContainer(fields, containerId, childId);
    onFieldsChange(newFields);
    if (selectedField && selectedField.id === childId) {
      onFieldSelect(null);
    }
  };

  const updateContainer = (containerId: string, children: FormField[]) => {
    const newFields = fields.map(field => {
      if (field.id === containerId) {
        return { ...field, children };
      }
      return field;
    });
    onFieldsChange(newFields);
  };

  const getFieldIcon = (field: FormField) => {
    const allTypes = [...FIELD_TYPES, ...WIDGET_TYPES];
    const fieldType = allTypes.find(
      (ft) =>
        ft.type === field.type &&
        (field.config.format ? ft.defaultConfig.format === field.config.format : true)
    );
    const IconComponent = fieldType ? (LucideIcons as any)[fieldType.icon] : null;
    return IconComponent;
  };

  const handleResizeClick = (e: React.MouseEvent, field: FormField) => {
    e.preventDefault();
    e.stopPropagation();

    const currentSize = field.size || 'full';
    let newSize: FieldSize;

    switch (currentSize) {
      case 'small':
        newSize = 'medium';
        break;
      case 'medium':
        newSize = 'large';
        break;
      case 'large':
        newSize = 'full';
        break;
      case 'full':
      default:
        newSize = 'small';
        break;
    }

    updateFieldSize(field.id, newSize);
  };

  const updateFieldSize = (fieldId: string, size: FieldSize) => {
    const updateFieldsRecursively = (fieldsList: FormField[]): FormField[] => {
      return fieldsList.map(field => {
        if (field.id === fieldId) {
          return { ...field, size };
        }
        if (field.isContainer && field.children) {
          return {
            ...field,
            children: updateFieldsRecursively(field.children),
          };
        }
        return field;
      });
    };

    onFieldsChange(updateFieldsRecursively(fields));
  };


  const renderField = (field: FormField, index: number, containerId?: string) => {
    const IconComponent = getFieldIcon(field);
    const isSelected = selectedField?.id === field.id;
    const isContainer = field.isContainer;
    const isSection = field.type === 'container' && field.config.title === 'Section';
    const isSubsection = field.type === 'container' && field.config.title === 'Subsection';

    const getSizePercentage = (size?: FieldSize) => {
      switch (size) {
        case 'small': return '25%';
        case 'medium': return '50%';
        case 'large': return '75%';
        default: return '100%';
      }
    };

    const getSizeClass = (size?: FieldSize) => {
      switch (size) {
        case 'small': return 'w-[calc(25%-9px)]';
        case 'medium': return 'w-[calc(50%-6px)]';
        case 'large': return 'w-[calc(75%-3px)]';
        default: return 'w-full';
      }
    };

    if (isContainer) {
      return (
        <div
          key={field.id}
          className={`relative ${getSizeClass(field.size)} flex-shrink-0 transition-all duration-200`}
          onDragOver={(e) => handleDragOver(e, index, containerId)}
          onDragLeave={handleDragLeave}
        >
          {dragOverIndex === index && !containerId && (
            <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-lg z-10">
              <div className="absolute inset-0 bg-blue-400 animate-pulse rounded-full"></div>
            </div>
          )}
          <div
            onClick={() => onFieldSelect(field)}
            className={`group rounded-lg transition-all ${
              isSection
                ? 'border-2 border-teal-300 bg-teal-50/50'
                : 'border-2 border-teal-200 bg-teal-50/30'
            } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${dragOverIndex === index && !containerId ? 'opacity-50' : ''}`}
          >
            <div
              draggable
              onDragStart={(e) => handleFieldDragStart(e, field, index, containerId)}
              className="flex items-center gap-3 p-3 border-b border-teal-200 bg-white/50 cursor-move"
            >
              <GripVertical className="w-5 h-5 text-teal-400" />
              {IconComponent && <IconComponent className="w-5 h-5 text-teal-600" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-teal-900">{field.label}</span>
                  <span className="text-xs text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                    {isSection ? 'Section' : 'Subsection'}
                  </span>
                  <button
                    onClick={(e) => handleResizeClick(e, field)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 text-teal-600 rounded text-xs font-medium cursor-pointer hover:bg-teal-100 transition-colors"
                    title="Click to resize"
                  >
                    <Maximize2 className="w-3 h-3" />
                    {getSizePercentage(field.size)}
                  </button>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldSelect(field);
                }}
                className="p-2 text-teal-400 hover:text-teal-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  containerId ? removeChildField(containerId, field.id) : removeField(index);
                }}
                className="p-2 text-teal-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div
              onDrop={(e) => handleDrop(e, field.id)}
              onDragOver={(e) => handleDragOver(e, undefined, field.id)}
              onDragLeave={handleDragLeave}
              className={`p-4 min-h-[100px] ${
                dragOverContainer === field.id ? 'bg-teal-100/50 border-2 border-dashed border-teal-400' : ''
              }`}
            >
              {!field.children || field.children.length === 0 ? (
                <div className="flex items-center justify-center h-full text-teal-400 border-2 border-dashed border-teal-200 rounded-lg p-6">
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Drop fields here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {field.children.map((child, childIndex) => (
                    <div key={child.id}>{renderField(child, childIndex, field.id)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={field.id}
        className={`relative ${getSizeClass(field.size)} flex-shrink-0 transition-all duration-200`}
        onDragOver={(e) => handleDragOver(e, index, containerId)}
        onDragLeave={handleDragLeave}
      >
        {dragOverIndex === index && !containerId && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-lg z-10">
            <div className="absolute inset-0 bg-blue-400 animate-pulse rounded-full"></div>
          </div>
        )}
        <div className="h-full">
          <div
            draggable
            onDragStart={(e) => handleFieldDragStart(e, field, index, containerId)}
            onClick={() => onFieldSelect(field)}
            className={`group rounded-xl border-2 transition-all cursor-move ${
              isSelected
                ? 'border-blue-400 bg-white shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            } ${dragOverIndex === index && !containerId ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-3 p-4">
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {IconComponent && <IconComponent className="w-5 h-5 text-gray-700 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">{field.name}</span>
                  <button
                    onClick={(e) => handleResizeClick(e, field)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                    title="Click to resize"
                  >
                    <Maximize2 className="w-3 h-3" />
                    {getSizePercentage(field.size)}
                  </button>
                </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900">{field.label}</span>
                {field.required && (
                  <span className="text-xs text-red-500 font-semibold">*</span>
                )}
                {field.visibility?.enabled && (
                  <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3" />
                    Conditional
                  </span>
                )}
                {field.readonly?.enabled && (
                  <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Read-only
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFieldSelect(field);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                containerId ? removeChildField(containerId, field.id) : removeField(index);
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const groupFieldsIntoRows = () => {
    const rows: FormField[][] = [];
    let currentRow: FormField[] = [];

    fields.forEach((field) => {
      const fieldSize = field.size || 'full';

      if (fieldSize === 'full') {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([field]);
      } else {
        currentRow.push(field);
        const totalWidth = currentRow.reduce((sum, f) => {
          const size = f.size || 'full';
          return sum + (size === 'small' ? 25 : size === 'medium' ? 50 : size === 'large' ? 75 : 100);
        }, 0);

        if (totalWidth >= 100) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const rows = groupFieldsIntoRows();

  const handleDropZoneDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDropZone(index);
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDropZone(null);
  };

  const handleDropZoneDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const fieldTypeData = e.dataTransfer.getData('fieldType');
    const existingFieldData = e.dataTransfer.getData('existingField');

    if (fieldTypeData) {
      const fieldType = JSON.parse(fieldTypeData);
      const newField: FormField = {
        id: `field_${Date.now()}`,
        name: `field_${fields.length + 1}`,
        label: fieldType.defaultConfig.title || fieldType.label,
        type: fieldType.type,
        required: false,
        config: { ...fieldType.defaultConfig },
        isContainer: fieldType.type === 'container',
        children: fieldType.type === 'container' ? [] : undefined,
      };

      const newFields = [...fields];
      newFields.splice(targetIndex, 0, newField);
      onFieldsChange(newFields);
    } else if (existingFieldData) {
      const { fieldId, sourceIndex, sourceContainerId } = JSON.parse(existingFieldData);

      if (sourceContainerId) {
        const field = findFieldInContainer(fields, sourceContainerId, fieldId);
        if (field) {
          let newFields = removeFieldFromContainer(fields, sourceContainerId, fieldId);
          newFields.splice(targetIndex, 0, field);
          onFieldsChange(newFields);
        }
      } else {
        const field = fields[sourceIndex];
        let newFields = [...fields];
        newFields.splice(sourceIndex, 1);

        const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newFields.splice(adjustedIndex, 0, field);
        onFieldsChange(newFields);
      }
    }

    setDragOverDropZone(null);
  };

  return (
    <div
      onDrop={(e) => handleDrop(e)}
      onDragOver={(e) => handleDragOver(e)}
      onDragLeave={handleDragLeave}
      className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 min-h-[500px]"
    >
      {fields.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-center">
            Drag and drop fields here to build your form
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-3 items-stretch">
              {row.map((field, indexInRow) => {
                const fieldIndex = fields.indexOf(field);
                return (
                  <div key={field.id} className="contents">
                    {indexInRow === 0 && (
                      <div
                        onDragOver={(e) => handleDropZoneDragOver(e, fieldIndex)}
                        onDragLeave={handleDropZoneDragLeave}
                        onDrop={(e) => handleDropZoneDrop(e, fieldIndex)}
                        className={`flex-shrink-0 transition-all ${
                          dragOverDropZone === fieldIndex
                            ? 'w-12 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg'
                            : 'w-0'
                        }`}
                      >
                        {dragOverDropZone === fieldIndex && (
                          <div className="h-full flex items-center justify-center">
                            <div className="w-1 h-full bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    )}
                    {renderField(field, fieldIndex)}
                    <div
                      onDragOver={(e) => handleDropZoneDragOver(e, fieldIndex + 1)}
                      onDragLeave={handleDropZoneDragLeave}
                      onDrop={(e) => handleDropZoneDrop(e, fieldIndex + 1)}
                      className={`flex-shrink-0 transition-all ${
                        dragOverDropZone === fieldIndex + 1
                          ? 'w-12 bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg'
                          : 'w-0'
                      }`}
                    >
                      {dragOverDropZone === fieldIndex + 1 && (
                        <div className="h-full flex items-center justify-center">
                          <div className="w-1 h-full bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
