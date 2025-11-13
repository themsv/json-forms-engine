import { useState } from 'react';
import { Save, Plus, Eye, Code } from 'lucide-react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FieldSettings from './FieldSettings';
import FormPreview from './FormPreview';
import SchemaViewer from './SchemaViewer';
import FormsList from './FormsList';
import { FormField } from '../types/formBuilder';
import { supabase, Form } from '../lib/supabase';

export default function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'builder' | 'preview' | 'schema'>('builder');
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const generateSchema = () => {
    const properties: any = {};
    const required: string[] = [];

    const processFields = (fieldList: FormField[], parentProperties: any, parentRequired: string[]): any[] => {
      const elements: any[] = [];
      let currentRow: any[] = [];
      let currentRowWidth = 0;

      const getSizeWidth = (size?: string) => {
        switch (size) {
          case 'small': return 3;
          case 'medium': return 6;
          case 'large': return 9;
          case 'full':
          default: return 12;
        }
      };

      const flushRow = () => {
        if (currentRow.length > 0) {
          if (currentRow.length === 1) {
            elements.push(currentRow[0]);
          } else {
            const horizontalElements = currentRow.map((el, idx) => {
              const fieldData = fieldList.find(f => el.scope === `#/properties/${f.name}`);
              const width = getSizeWidth(fieldData?.size);
              return {
                ...el,
                options: {
                  ...el.options,
                  xs: width,
                },
              };
            });
            elements.push({
              type: 'HorizontalLayout',
              elements: horizontalElements,
            });
          }
          currentRow = [];
          currentRowWidth = 0;
        }
      };

      fieldList.forEach((field) => {
        if (field.isContainer && field.children) {
          flushRow();

          const childElements = processFields(field.children, parentProperties, parentRequired);
          const isSection = field.config.title === 'Section';

          const groupElement: any = {
            type: 'Group',
            label: field.label,
            elements: childElements,
            options: {
              detail: isSection ? 'GENERATED' : 'NONE',
            },
          };

          elements.push(groupElement);
        } else {
          parentProperties[field.name] = {
            ...field.config,
            title: field.label,
          };

          if (field.required) {
            parentRequired.push(field.name);
          }

          const element: any = {
            type: 'Control',
            scope: `#/properties/${field.name}`,
          };

          if (field.type === 'string' && !field.config.format && !field.config.enum) {
            element.options = {
              multi: true,
            };
          }

          if (field.visibility?.enabled && field.visibility.condition) {
            const condition = field.visibility.condition;
            element.rule = {
              effect: 'SHOW',
              condition: {
                scope: `#/properties/${condition.field}`,
                schema: buildConditionSchema(condition),
              },
            };
          }

          if (field.readonly?.enabled && field.readonly.condition) {
            const condition = field.readonly.condition;
            if (!element.rule) {
              element.rule = {
                effect: 'DISABLE',
                condition: {
                  scope: `#/properties/${condition.field}`,
                  schema: buildConditionSchema(condition),
                },
              };
            } else {
              element.options = element.options || {};
              element.options.readonly = {
                condition: {
                  scope: `#/properties/${condition.field}`,
                  schema: buildConditionSchema(condition),
                },
              };
            }
          }

          const fieldWidth = getSizeWidth(field.size);

          if (currentRowWidth + fieldWidth > 12 || fieldWidth === 12) {
            flushRow();
          }

          if (fieldWidth === 12) {
            elements.push(element);
          } else {
            currentRow.push(element);
            currentRowWidth += fieldWidth;
          }
        }
      });

      flushRow();
      return elements;
    };

    const uiElements = processFields(fields, properties, required);

    return {
      schema: {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {}),
      },
      uiSchema: {
        type: 'VerticalLayout',
        elements: uiElements,
      },
    };
  };

  const buildConditionSchema = (condition: any) => {
    switch (condition.operator) {
      case 'equals':
        return { const: condition.value };
      case 'notEquals':
        return { not: { const: condition.value } };
      case 'contains':
        return { pattern: condition.value };
      case 'greaterThan':
        return { minimum: condition.value, exclusiveMinimum: true };
      case 'lessThan':
        return { maximum: condition.value, exclusiveMaximum: true };
      case 'isEmpty':
        return { maxLength: 0 };
      case 'isNotEmpty':
        return { minLength: 1 };
      default:
        return { const: condition.value };
    }
  };

  const { schema, uiSchema } = generateSchema();

  const handleFieldUpdate = (updatedField: FormField) => {
    setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
    setSelectedField(updatedField);
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    try {
      setIsSaving(true);
      const formData = {
        name: formName,
        description: formDescription,
        schema,
        ui_schema: uiSchema,
        updated_at: new Date().toISOString(),
      };

      if (currentFormId) {
        const { error } = await supabase.from('forms').update(formData).eq('id', currentFormId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('forms')
          .insert([formData])
          .select()
          .single();
        if (error) throw error;
        setCurrentFormId(data.id);
      }

      setRefreshTrigger((prev) => prev + 1);
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadForm = (form: Form) => {
    setFormName(form.name);
    setFormDescription(form.description);
    setCurrentFormId(form.id);

    const loadedFields: FormField[] = [];
    const properties = form.schema.properties || {};
    const uiElements = form.ui_schema?.elements || [];

    Object.keys(properties).forEach((key, index) => {
      const prop = properties[key];
      const uiElement = uiElements.find((el: any) => el.scope === `#/properties/${key}`);

      const field: FormField = {
        id: `field_${Date.now()}_${index}`,
        name: key,
        label: prop.title || key,
        type: prop.type,
        required: form.schema.required?.includes(key) || false,
        config: prop,
        size: 'full',
      };

      if (uiElement?.rule?.effect === 'SHOW') {
        field.visibility = {
          enabled: true,
          condition: parseConditionFromSchema(uiElement.rule.condition),
        };
      }

      if (uiElement?.rule?.effect === 'DISABLE') {
        field.readonly = {
          enabled: true,
          condition: parseConditionFromSchema(uiElement.rule.condition),
        };
      }

      loadedFields.push(field);
    });

    setFields(loadedFields);
    setSelectedField(null);
    setActiveView('builder');
  };

  const parseConditionFromSchema = (ruleCondition: any) => {
    const field = ruleCondition.scope?.replace('#/properties/', '');
    const schema = ruleCondition.schema;

    let operator: any = 'equals';
    let value: any = '';

    if (schema.const !== undefined) {
      operator = 'equals';
      value = schema.const;
    } else if (schema.not?.const !== undefined) {
      operator = 'notEquals';
      value = schema.not.const;
    } else if (schema.pattern) {
      operator = 'contains';
      value = schema.pattern;
    } else if (schema.minimum !== undefined) {
      operator = 'greaterThan';
      value = schema.minimum;
    } else if (schema.maximum !== undefined) {
      operator = 'lessThan';
      value = schema.maximum;
    } else if (schema.maxLength === 0) {
      operator = 'isEmpty';
    } else if (schema.minLength === 1) {
      operator = 'isNotEmpty';
    }

    return { field, operator, value };
  };

  const handleNewForm = () => {
    if (fields.length > 0 && !confirm('Start a new form? Unsaved changes will be lost.')) {
      return;
    }
    setFields([]);
    setFormName('');
    setFormDescription('');
    setCurrentFormId(null);
    setSelectedField(null);
    setActiveView('builder');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Create dynamic forms with drag-and-drop
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewForm}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Form
              </button>
              <button
                onClick={handleSaveForm}
                disabled={isSaving || fields.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1 w-fit">
            <button
              onClick={() => setActiveView('builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeView === 'builder'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              Builder
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeView === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveView('schema')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeView === 'schema'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Code className="w-4 h-4" />
              Schema
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-2">
            <div className="space-y-6 sticky top-6">
              <FieldPalette onDragStart={() => {}} />
              <FormsList
                onSelectForm={handleLoadForm}
                onDeleteForm={() => setRefreshTrigger((prev) => prev + 1)}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>

          <div className="col-span-8">
            {activeView === 'builder' && (
              <FormCanvas
                fields={fields}
                onFieldsChange={setFields}
                onFieldSelect={setSelectedField}
                selectedField={selectedField}
              />
            )}
            {activeView === 'preview' && <FormPreview schema={schema} uiSchema={uiSchema} />}
            {activeView === 'schema' && <SchemaViewer schema={schema} uiSchema={uiSchema} />}
          </div>

          <div className="col-span-2">
            {selectedField && activeView === 'builder' && (
              <div className="sticky top-6">
                <FieldSettings
                  field={selectedField}
                  allFields={fields}
                  onUpdate={handleFieldUpdate}
                  onClose={() => setSelectedField(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
