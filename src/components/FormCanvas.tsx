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
  const [dragOverDropZone, setDragOverDropZone] = useState<{ row: number; position: number } | null>(null);
  const [containerDropZones, setContainerDropZones] = useState<{ [containerId: string]: number | null }>({});
  const [isDragging, setIsDragging] = useState(false);

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
        isContainer: fieldType.type === 'container' || fieldType.type === 'panel',
        children: (fieldType.type === 'container' || fieldType.type === 'panel') ? [] : undefined,
        row: fields.length,
        panelState: fieldType.type === 'panel' ? 'normal' : undefined,
        panelWidth: fieldType.type === 'panel' ? '100%' : undefined,
        panelHeight: fieldType.type === 'panel' ? '400px' : undefined,
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
            newFields = [...newFields, { ...field, row: newFields.length }];
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
          newFields.splice(targetIndex, 0, { ...field, row: targetIndex });

          newFields.forEach((f, idx) => {
            f.row = idx;
          });
        }
        onFieldsChange(newFields);
      }
    }

    setDragOverIndex(null);
    setDragOverContainer(null);
    setIsDragging(false);
  };

  const findFieldInContainer = (fields: FormField[], containerId: string, fieldId: string): FormField | null => {
    for (const field of fields) {
      if (field.id === containerId && field.children) {
        const found = field.children.find(c => c.id === fieldId);
        if (found) return found;
      }
      if (field.isContainer && field.children) {
        const found = findFieldInContainer(field.children, containerId, fieldId);
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
      if (field.isContainer && field.children) {
        return {
          ...field,
          children: addFieldToContainer(field.children, containerId, newField),
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
      if (field.isContainer && field.children) {
        return {
          ...field,
          children: removeFieldFromContainer(field.children, containerId, fieldId),
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
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverDropZone(null);
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
    const isPanel = field.type === 'panel';
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

    if (isPanel) {
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
            className={`group rounded-lg transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''} ${dragOverIndex === index && !containerId ? 'opacity-50' : ''}`}
          >
            <div
              draggable
              onDragStart={(e) => handleFieldDragStart(e, field, index, containerId)}
              onDragEnd={handleDragEnd}
              className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600 cursor-move rounded-t-lg"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                {IconComponent && <IconComponent className="w-4 h-4 text-blue-600" />}
                <span className="font-semibold text-gray-800 dark:text-white text-sm">{field.label}</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Panel</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFieldSelect(field);
                  }}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    containerId ? removeChildField(containerId, field.id) : removeField(index);
                  }}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              onDrop={(e) => handleDrop(e, field.id)}
              onDragOver={(e) => handleDragOver(e, undefined, field.id)}
              onDragLeave={handleDragLeave}
              className={`p-4 min-h-[200px] bg-white dark:bg-gray-800 rounded-b-lg border-2 border-gray-200 dark:border-gray-700 ${
                dragOverContainer === field.id ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : ''
              }`}
            >
              {!field.children || field.children.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 min-h-[150px]">
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Drop components here</p>
                    <p className="text-xs mt-1">Charts, Tables, Dropdowns, etc.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupFieldsIntoRows(field.children).map((row, rowIndex) => (
                    <div key={`panel-${field.id}-row-${rowIndex}`} className="relative group/container-row">
                      <div className="flex gap-3 items-stretch relative">
                        {row.map((child, indexInRow) => {
                          const childIndex = field.children!.indexOf(child);
                          return (
                            <div key={child.id} className="contents">
                              {indexInRow === 0 && (
                                <div
                                  onDragOver={(e) => handleContainerDropZoneDragOver(e, field.id, childIndex)}
                                  onDragLeave={(e) => handleContainerDropZoneDragLeave(e, field.id)}
                                  onDrop={(e) => handleContainerDropZoneDrop(e, field.id, childIndex)}
                                  className={`flex-shrink-0 transition-all duration-200 ${
                                    containerDropZones[field.id] === childIndex
                                      ? 'w-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg'
                                      : 'w-0'
                                  }`}
                                >
                                  {containerDropZones[field.id] === childIndex && (
                                    <div className="h-full flex items-center justify-center">
                                      <div className="w-1 h-full bg-blue-500 rounded-full shadow-lg"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {renderField(child, childIndex, field.id)}
                              <div
                                onDragOver={(e) => handleContainerDropZoneDragOver(e, field.id, childIndex + 1)}
                                onDragLeave={(e) => handleContainerDropZoneDragLeave(e, field.id)}
                                onDrop={(e) => handleContainerDropZoneDrop(e, field.id, childIndex + 1)}
                                className={`flex-shrink-0 transition-all duration-200 ${
                                  containerDropZones[field.id] === childIndex + 1
                                    ? 'w-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg'
                                    : 'w-0'
                                }`}
                              >
                                {containerDropZones[field.id] === childIndex + 1 && (
                                  <div className="h-full flex items-center justify-center">
                                    <div className="w-1 h-full bg-blue-500 rounded-full shadow-lg"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

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
              onDragEnd={handleDragEnd}
              className="flex items-center gap-3 p-3 border-b border-teal-200 bg-white dark:bg-gray-800/50 cursor-move"
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
                dragOverContainer === field.id ? 'bg-teal-100/50 dark:bg-teal-900/20 border-2 border-dashed border-teal-400' : ''
              }`}
            >
              {!field.children || field.children.length === 0 ? (
                <div className="flex items-center justify-center h-full text-teal-400 border-2 border-dashed border-teal-200 dark:border-teal-700 rounded-lg p-6">
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Drop fields here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupFieldsIntoRows(field.children).map((row, rowIndex) => (
                    <div key={`container-${field.id}-row-${rowIndex}`} className="relative group/container-row">
                      <div className="flex gap-3 items-stretch relative">
                        {row.map((child, indexInRow) => {
                          const childIndex = field.children!.indexOf(child);
                          return (
                            <div key={child.id} className="contents">
                              {indexInRow === 0 && (
                                <div
                                  onDragOver={(e) => handleContainerDropZoneDragOver(e, field.id, childIndex)}
                                  onDragLeave={(e) => handleContainerDropZoneDragLeave(e, field.id)}
                                  onDrop={(e) => handleContainerDropZoneDrop(e, field.id, childIndex)}
                                  className={`flex-shrink-0 transition-all duration-200 ${
                                    containerDropZones[field.id] === childIndex
                                      ? 'w-12 bg-teal-100 dark:bg-teal-900/30 border-2 border-dashed border-teal-400 dark:border-teal-500 rounded-lg'
                                      : 'w-0'
                                  }`}
                                >
                                  {containerDropZones[field.id] === childIndex && (
                                    <div className="h-full flex items-center justify-center">
                                      <div className="w-1 h-full bg-teal-500 rounded-full shadow-lg"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {renderField(child, childIndex, field.id)}
                              <div
                                onDragOver={(e) => handleContainerDropZoneDragOver(e, field.id, childIndex + 1)}
                                onDragLeave={(e) => handleContainerDropZoneDragLeave(e, field.id)}
                                onDrop={(e) => handleContainerDropZoneDrop(e, field.id, childIndex + 1)}
                                className={`flex-shrink-0 transition-all duration-200 ${
                                  containerDropZones[field.id] === childIndex + 1
                                    ? 'w-12 bg-teal-100 dark:bg-teal-900/30 border-2 border-dashed border-teal-400 dark:border-teal-500 rounded-lg'
                                    : 'w-0'
                                }`}
                              >
                                {containerDropZones[field.id] === childIndex + 1 && (
                                  <div className="h-full flex items-center justify-center">
                                    <div className="w-1 h-full bg-teal-500 rounded-full shadow-lg"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
            onDragEnd={handleDragEnd}
            onClick={() => onFieldSelect(field)}
            className={`group rounded-xl border-2 transition-all cursor-move ${
              isSelected
                ? 'border-blue-400 bg-white dark:bg-gray-800 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:shadow-sm'
            } ${dragOverIndex === index && !containerId ? 'opacity-50' : ''}`}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                {IconComponent && <IconComponent className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{field.name}</span>
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
                  <span className="font-medium text-gray-900 dark:text-white">{field.label}</span>
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
              </div>
              {field.type === 'array' && field.config.columns && (
                <div className="px-4 pb-3">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {field.config.columns.map((col: any, idx: number) => (
                            <th key={idx} className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-gray-800">
                          {field.config.columns.map((col: any, idx: number) => (
                            <td key={idx} className="px-3 py-2 text-gray-400 dark:text-gray-500 border-b border-gray-100">
                              {col.type === 'string' ? 'Text...' : col.type === 'number' ? '0' : col.type === 'boolean' ? '☐' : 'mm/dd/yyyy'}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          {field.config.columns.map((col: any, idx: number) => (
                            <td key={idx} className="px-3 py-2 text-gray-400 dark:text-gray-500">
                              {col.type === 'string' ? 'Text...' : col.type === 'number' ? '0' : col.type === 'boolean' ? '☐' : 'mm/dd/yyyy'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFieldSelect(field);
                  }}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    containerId ? removeChildField(containerId, field.id) : removeField(index);
                  }}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const groupFieldsIntoRows = (fieldsList: FormField[]) => {
    const rowsMap: { [row: number]: FormField[] } = {};

    fieldsList.forEach((field, index) => {
      const rowNumber = field.row !== undefined ? field.row : index;
      if (!rowsMap[rowNumber]) {
        rowsMap[rowNumber] = [];
      }
      rowsMap[rowNumber].push(field);
    });

    const sortedRowNumbers = Object.keys(rowsMap).map(Number).sort((a, b) => a - b);
    return sortedRowNumbers.map(rowNum => {
      return rowsMap[rowNum].sort((a, b) => (a.column || 0) - (b.column || 0));
    });
  };

  const handleContainerDropZoneDragOver = (e: React.DragEvent, containerId: string, childIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContainerDropZones({ ...containerDropZones, [containerId]: childIndex });
  };

  const handleContainerDropZoneDragLeave = (e: React.DragEvent, containerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContainerDropZones({ ...containerDropZones, [containerId]: null });
  };

  const handleContainerDropZoneDrop = (e: React.DragEvent, containerId: string, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const fieldTypeData = e.dataTransfer.getData('fieldType');
    const existingFieldData = e.dataTransfer.getData('existingField');

    if (fieldTypeData) {
      const fieldType = JSON.parse(fieldTypeData);
      const newField: FormField = {
        id: `field_${Date.now()}`,
        name: `field_${Date.now()}`,
        label: fieldType.defaultConfig.title || fieldType.label,
        type: fieldType.type,
        required: false,
        config: { ...fieldType.defaultConfig },
        isContainer: fieldType.type === 'container',
        children: fieldType.type === 'container' ? [] : undefined,
      };

      const newFields = insertFieldIntoContainer(fields, containerId, newField, targetIndex);
      onFieldsChange(newFields);
    } else if (existingFieldData) {
      const { fieldId, sourceIndex, sourceContainerId } = JSON.parse(existingFieldData);

      if (sourceContainerId === containerId) {
        const container = findContainer(fields, containerId);
        if (container && container.children) {
          const field = container.children[sourceIndex];
          let newChildren = [...container.children];
          newChildren.splice(sourceIndex, 1);
          const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
          newChildren.splice(adjustedIndex, 0, field);

          const newFields = updateContainerChildren(fields, containerId, newChildren);
          onFieldsChange(newFields);
        }
      } else {
        const field = sourceContainerId
          ? findFieldInContainer(fields, sourceContainerId, fieldId)
          : fields[sourceIndex];

        if (field) {
          let newFields = sourceContainerId
            ? removeFieldFromContainer(fields, sourceContainerId, fieldId)
            : fields.filter((_, i) => i !== sourceIndex);

          newFields = insertFieldIntoContainer(newFields, containerId, field, targetIndex);
          onFieldsChange(newFields);
        }
      }
    }

    setContainerDropZones({ ...containerDropZones, [containerId]: null });
  };

  const findContainer = (fieldsList: FormField[], containerId: string): FormField | null => {
    for (const field of fieldsList) {
      if (field.id === containerId) {
        return field;
      }
      if (field.isContainer && field.children) {
        const found = findContainer(field.children, containerId);
        if (found) return found;
      }
    }
    return null;
  };

  const insertFieldIntoContainer = (fieldsList: FormField[], containerId: string, newField: FormField, index: number): FormField[] => {
    return fieldsList.map(field => {
      if (field.id === containerId && field.isContainer) {
        const children = [...(field.children || [])];
        children.splice(index, 0, newField);
        return { ...field, children };
      }
      if (field.isContainer && field.children) {
        return {
          ...field,
          children: insertFieldIntoContainer(field.children, containerId, newField, index),
        };
      }
      return field;
    });
  };

  const updateContainerChildren = (fieldsList: FormField[], containerId: string, newChildren: FormField[]): FormField[] => {
    return fieldsList.map(field => {
      if (field.id === containerId && field.isContainer) {
        return { ...field, children: newChildren };
      }
      if (field.isContainer && field.children) {
        return {
          ...field,
          children: updateContainerChildren(field.children, containerId, newChildren),
        };
      }
      return field;
    });
  };

  const rows = groupFieldsIntoRows(fields);

  const handleDropZoneDragOver = (e: React.DragEvent, rowNum: number, position: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDropZone({ row: rowNum, position });
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDropZone(null);
  };

  const handleDropZoneDrop = (e: React.DragEvent, targetRow: number, targetPosition: number) => {
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
        row: targetRow,
        column: targetPosition,
      };

      const newFields = [...fields];
      const targetIndex = fields.findIndex(f => f.row === targetRow && (f.column || 0) >= targetPosition);

      if (targetIndex === -1) {
        newFields.push(newField);
      } else {
        newFields.splice(targetIndex, 0, newField);
      }

      newFields.forEach((f, idx) => {
        if (f.row === targetRow && (f.column || 0) >= targetPosition) {
          f.column = (f.column || 0) + 1;
        }
      });

      onFieldsChange(newFields);
    } else if (existingFieldData) {
      const { fieldId, sourceIndex, sourceContainerId } = JSON.parse(existingFieldData);

      if (sourceContainerId) {
        const field = findFieldInContainer(fields, sourceContainerId, fieldId);
        if (field) {
          let newFields = removeFieldFromContainer(fields, sourceContainerId, fieldId);
          const updatedField = { ...field, row: targetRow, column: targetPosition };

          const targetIndex = newFields.findIndex(f => f.row === targetRow && (f.column || 0) >= targetPosition);
          if (targetIndex === -1) {
            newFields.push(updatedField);
          } else {
            newFields.splice(targetIndex, 0, updatedField);
          }

          newFields.forEach(f => {
            if (f.row === targetRow && f.id !== updatedField.id && (f.column || 0) >= targetPosition) {
              f.column = (f.column || 0) + 1;
            }
          });

          onFieldsChange(newFields);
        }
      } else {
        const field = fields[sourceIndex];
        let newFields = [...fields];

        const oldRow = field.row || 0;
        const oldColumn = field.column || 0;

        newFields.splice(sourceIndex, 1);

        const updatedField = { ...field, row: targetRow, column: targetPosition };
        const targetIndex = newFields.findIndex(f => f.row === targetRow && (f.column || 0) >= targetPosition);

        if (targetIndex === -1) {
          newFields.push(updatedField);
        } else {
          newFields.splice(targetIndex, 0, updatedField);
        }

        newFields.forEach(f => {
          if (f.row === oldRow && (f.column || 0) > oldColumn) {
            f.column = Math.max(0, (f.column || 0) - 1);
          }
          if (f.row === targetRow && f.id !== updatedField.id && (f.column || 0) >= targetPosition) {
            f.column = (f.column || 0) + 1;
          }
        });

        onFieldsChange(newFields);
      }
    }

    setDragOverDropZone(null);
    setIsDragging(false);
  };

  return (
    <div
      onDrop={(e) => handleDrop(e)}
      onDragOver={(e) => handleDragOver(e)}
      onDragLeave={handleDragLeave}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 min-h-[500px]"
    >
      {fields.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Drop fields here to build your form</p>
            <p className="text-sm">Drag fields between drop zones to arrange them in rows</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, rowIndex) => {
            const actualRowNumber = row[0]?.row !== undefined ? row[0].row : rowIndex;
            const nextRowNumber = actualRowNumber + 1;
            return (
              <div key={`row-${rowIndex}`}>
                {rowIndex === 0 && (
                  <div
                    onDragOver={(e) => handleDropZoneDragOver(e, actualRowNumber, 0)}
                    onDragLeave={handleDropZoneDragLeave}
                    onDrop={(e) => handleDropZoneDrop(e, actualRowNumber, 0)}
                    className={`transition-all duration-200 mb-2 ${
                      dragOverDropZone?.row === actualRowNumber && dragOverDropZone?.position === 0
                        ? 'h-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg'
                        : 'h-1'
                    }`}
                  >
                    {dragOverDropZone?.row === actualRowNumber && dragOverDropZone?.position === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <div className="h-1 w-full bg-blue-500 rounded-full shadow-lg"></div>
                      </div>
                    )}
                  </div>
                )}
                <div className="relative group/row">
                  <div className="flex gap-3 items-stretch relative">
                    {row.map((field, indexInRow) => {
                      const fieldIndex = fields.indexOf(field);
                      const isDropZoneActive = dragOverDropZone?.row === actualRowNumber;
                      return (
                        <div key={field.id} className="contents">
                          <div
                            onDragOver={(e) => handleDropZoneDragOver(e, actualRowNumber, indexInRow)}
                            onDragLeave={handleDropZoneDragLeave}
                            onDrop={(e) => handleDropZoneDrop(e, actualRowNumber, indexInRow)}
                            className={`flex-shrink-0 transition-all duration-200 flex items-center justify-center ${
                              isDropZoneActive && dragOverDropZone?.position === indexInRow
                                ? 'w-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg'
                                : isDragging
                                ? 'w-3 bg-gray-50 dark:bg-gray-800 opacity-70'
                                : 'w-0'
                            }`}
                          >
                            {isDropZoneActive && dragOverDropZone?.position === indexInRow ? (
                              <div className="w-1 h-full bg-blue-500 rounded-full shadow-lg"></div>
                            ) : isDragging ? (
                              <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            ) : null}
                          </div>
                          {renderField(field, fieldIndex)}
                          <div
                            onDragOver={(e) => handleDropZoneDragOver(e, actualRowNumber, indexInRow + 1)}
                            onDragLeave={handleDropZoneDragLeave}
                            onDrop={(e) => handleDropZoneDrop(e, actualRowNumber, indexInRow + 1)}
                            className={`flex-shrink-0 transition-all duration-200 flex items-center justify-center ${
                              isDropZoneActive && dragOverDropZone?.position === indexInRow + 1
                                ? 'w-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg'
                                : isDragging
                                ? 'w-3 bg-gray-50 dark:bg-gray-800 opacity-70'
                                : 'w-0'
                            }`}
                          >
                            {isDropZoneActive && dragOverDropZone?.position === indexInRow + 1 ? (
                              <div className="w-1 h-full bg-blue-500 rounded-full shadow-lg"></div>
                            ) : isDragging ? (
                              <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                </div>
                <div
                  onDragOver={(e) => handleDropZoneDragOver(e, nextRowNumber, 0)}
                  onDragLeave={handleDropZoneDragLeave}
                  onDrop={(e) => handleDropZoneDrop(e, nextRowNumber, 0)}
                  className={`transition-all duration-200 mt-2 ${
                    dragOverDropZone?.row === nextRowNumber && dragOverDropZone?.position === 0
                      ? 'h-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg'
                      : 'h-1'
                  }`}
                >
                  {dragOverDropZone?.row === nextRowNumber && dragOverDropZone?.position === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-1 w-full bg-blue-500 rounded-full shadow-lg"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
