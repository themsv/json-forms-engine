import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, Unlock, Plus, Trash2 } from 'lucide-react';
import { FormField } from '../types/formBuilder';
import ConditionEditor from './ConditionEditor';

interface FieldSettingsProps {
  field: FormField | null;
  allFields: FormField[];
  onUpdate: (field: FormField) => void;
  onClose: () => void;
}

export default function FieldSettings({ field, allFields, onUpdate, onClose }: FieldSettingsProps) {
  const [localField, setLocalField] = useState<FormField | null>(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  if (!localField) return null;

  const handleChange = (key: string, value: any) => {
    const updated = { ...localField, [key]: value };
    setLocalField(updated);
    onUpdate(updated);
  };

  const handleConfigChange = (key: string, value: any) => {
    const updated = {
      ...localField,
      config: { ...localField.config, [key]: value },
    };
    setLocalField(updated);
    onUpdate(updated);
  };

  const handleEnumChange = (value: string) => {
    const enumValues = value.split('\n').filter((v) => v.trim());
    handleConfigChange('enum', enumValues);
  };

  const handleMultiEnumChange = (value: string) => {
    const enumValues = value.split('\n').filter((v) => v.trim());
    const updated = {
      ...localField,
      config: {
        ...localField.config,
        items: {
          ...localField.config.items,
          enum: enumValues,
        },
      },
    };
    setLocalField(updated);
    onUpdate(updated);
  };

  const isContainer = localField.isContainer;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {isContainer ? 'Container Settings' : 'Field Settings'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {!isContainer && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={localField.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isContainer ? 'Title' : 'Label'}
          </label>
          <input
            type="text"
            value={localField.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={localField.config.description || ''}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {!isContainer && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field Width
              </label>
              <select
                value={localField.size || 'full'}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="small">Small (25%)</option>
                <option value="medium">Medium (50%)</option>
                <option value="large">Large (75%)</option>
                <option value="full">Full Width (100%)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={localField.required}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="required" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Required Field
              </label>
            </div>
          </>
        )}

        {!isContainer && localField.type === 'string' && localField.config.enum && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Options (one per line)
            </label>
            <textarea
              value={localField.config.enum.join('\n')}
              onChange={(e) => handleEnumChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        )}

        {!isContainer && localField.type === 'array' && localField.config.items?.enum && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Options (one per line)
            </label>
            <textarea
              value={localField.config.items.enum.join('\n')}
              onChange={(e) => handleMultiEnumChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        )}

        {!isContainer && localField.type === 'number' && !localField.config.max && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={localField.config.minimum || ''}
                onChange={(e) =>
                  handleConfigChange('minimum', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={localField.config.maximum || ''}
                onChange={(e) =>
                  handleConfigChange('maximum', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {!isContainer && localField.type === 'number' && localField.config.max && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Rating
            </label>
            <input
              type="number"
              value={localField.config.max || 5}
              onChange={(e) =>
                handleConfigChange('max', e.target.value ? Number(e.target.value) : 5)
              }
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {!isContainer && localField.type === 'string' && localField.config.format === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Accepted File Types
            </label>
            <input
              type="text"
              value={localField.config.accept || '*/*'}
              onChange={(e) => handleConfigChange('accept', e.target.value)}
              placeholder="e.g., image/*, .pdf, .doc"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
              Use MIME types or file extensions (e.g., image/*, .pdf, .docx)
            </p>
          </div>
        )}

        {localField.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Content
            </label>
            <textarea
              value={localField.config.content || ''}
              onChange={(e) => handleConfigChange('content', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your text content here..."
            />
          </div>
        )}

        {localField.type === 'chart' && localField.config.data && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chart Data (JSON)
            </label>
            <textarea
              value={JSON.stringify(localField.config.data, null, 2)}
              onChange={(e) => {
                try {
                  const data = JSON.parse(e.target.value);
                  handleConfigChange('data', data);
                } catch (err) {
                  console.error('Invalid JSON');
                }
              }}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: [{"{"}"name": "Label", "value": 123{"}"}]
            </p>
          </div>
        )}

        {!isContainer && localField.type === 'array' && localField.config.columns && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Table Columns
            </label>
            <div className="space-y-2">
              {localField.config.columns.map((column: any, index: number) => (
                <div key={index} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={column.label}
                      onChange={(e) => {
                        const newColumns = [...localField.config.columns];
                        newColumns[index] = { ...column, label: e.target.value };
                        handleConfigChange('columns', newColumns);
                      }}
                      placeholder="Column Label"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => {
                        const newColumns = [...localField.config.columns];
                        newColumns[index] = { ...column, name: e.target.value };
                        handleConfigChange('columns', newColumns);
                      }}
                      placeholder="column_name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => {
                        const newColumns = [...localField.config.columns];
                        newColumns[index] = { ...column, type: e.target.value };
                        handleConfigChange('columns', newColumns);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="string">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Checkbox</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const newColumns = localField.config.columns.filter((_: any, i: number) => i !== index);
                      handleConfigChange('columns', newColumns);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newColumns = [
                    ...localField.config.columns,
                    { name: `column${localField.config.columns.length + 1}`, label: `Column ${localField.config.columns.length + 1}`, type: 'string' }
                  ];
                  handleConfigChange('columns', newColumns);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Column
              </button>
            </div>
          </div>
        )}

        {localField.type === 'navigation' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Navigation Items
            </label>
            <div className="space-y-2">
              {localField.config.items?.map((item: any, index: number) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const newItems = [...localField.config.items];
                        newItems[index] = { ...item, label: e.target.value };
                        handleConfigChange('items', newItems);
                      }}
                      placeholder="Label"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => {
                        const newItems = [...localField.config.items];
                        newItems[index] = { ...item, url: e.target.value };
                        handleConfigChange('items', newItems);
                      }}
                      placeholder="URL"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.active || false}
                        onChange={(e) => {
                          const newItems = [...localField.config.items];
                          newItems[index] = { ...item, active: e.target.checked };
                          handleConfigChange('items', newItems);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      const newItems = localField.config.items.filter((_: any, i: number) => i !== index);
                      handleConfigChange('items', newItems);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newItems = [
                    ...(localField.config.items || []),
                    { label: 'New Item', url: '#', active: false }
                  ];
                  handleConfigChange('items', newItems);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Nav Item
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout Style
              </label>
              <select
                value={localField.config.variant || 'horizontal'}
                onChange={(e) => handleConfigChange('variant', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          </div>
        )}

        {!isContainer && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Conditional Logic</h4>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {localField.visibility?.enabled ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conditional Visibility</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localField.visibility?.enabled || false}
                    onChange={(e) =>
                      handleChange('visibility', {
                        enabled: e.target.checked,
                        condition: localField.visibility?.condition,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                {localField.visibility?.enabled && (
                  <div className="mt-3">
                    <ConditionEditor
                      condition={localField.visibility.condition}
                      allFields={allFields}
                      currentFieldName={localField.name}
                      onChange={(condition) =>
                        handleChange('visibility', {
                          enabled: true,
                          condition,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {localField.readonly?.enabled ? (
                      <Lock className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conditional Read-Only</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localField.readonly?.enabled || false}
                    onChange={(e) =>
                      handleChange('readonly', {
                        enabled: e.target.checked,
                        condition: localField.readonly?.condition,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                {localField.readonly?.enabled && (
                  <div className="mt-3">
                    <ConditionEditor
                      condition={localField.readonly.condition}
                      allFields={allFields}
                      currentFieldName={localField.name}
                      onChange={(condition) =>
                        handleChange('readonly', {
                          enabled: true,
                          condition,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
