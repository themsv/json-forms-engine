import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
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

  const isContainer = localField.isContainer;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {isContainer ? 'Container Settings' : 'Field Settings'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {!isContainer && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="required" className="text-sm font-medium text-gray-700">
                Required Field
              </label>
            </div>
          </>
        )}

        {!isContainer && localField.type === 'string' && localField.config.enum && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options (one per line)
            </label>
            <textarea
              value={localField.config.enum.join('\n')}
              onChange={(e) => handleEnumChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        )}

        {!isContainer && localField.type === 'number' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

        {!isContainer && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Conditional Logic</h4>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {localField.visibility?.enabled ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Conditional Visibility</span>
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

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {localField.readonly?.enabled ? (
                      <Lock className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Conditional Read-Only</span>
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
