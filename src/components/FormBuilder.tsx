import { useState } from 'react';
import { Save, Plus, Eye, Code, Sun, Moon } from 'lucide-react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FieldSettings from './FieldSettings';
import FormPreview from './FormPreview';
import SchemaViewer from './SchemaViewer';
import FormsList from './FormsList';
import FormTemplates from './FormTemplates';
import { FormField } from '../types/formBuilder';
import { supabase, Form } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function FormBuilder() {
  const { theme, toggleTheme } = useTheme();
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
      const rowsMap: { [row: number]: any[] } = {};

      fieldList.forEach((field) => {
        if (field.isContainer && field.children) {
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

          const row = field.row || 0;
          if (!rowsMap[row]) rowsMap[row] = [];
          rowsMap[row].push(groupElement);
        } else {
          if (field.type === 'array' && field.config.columns) {
            const itemProperties: any = {};
            field.config.columns.forEach((col: any) => {
              itemProperties[col.name] = {
                type: col.type,
                title: col.label,
              };
            });

            parentProperties[field.name] = {
              type: 'array',
              title: field.label,
              items: {
                type: 'object',
                properties: itemProperties,
              },
            };
          } else if (field.type === 'chart') {
            parentProperties[field.name] = {
              type: 'string',
              title: field.label,
              chartType: field.config.chartType,
              data: field.config.data,
            };
          } else if (field.type === 'text') {
            parentProperties[field.name] = {
              type: 'string',
              title: field.label,
              textType: field.config.textType,
              content: field.config.content,
            };
          } else if (field.type === 'navigation') {
            parentProperties[field.name] = {
              type: 'string',
              title: field.label,
              navItems: field.config.items,
              navVariant: field.config.variant,
            };
          } else if (field.type === 'display') {
            parentProperties[field.name] = {
              type: 'string',
              title: field.label,
              description: field.config.description,
              variant: field.config.variant,
            };
          } else if (field.type === 'container') {
            parentProperties[field.name] = {
              type: 'string',
              title: field.label,
            };
          } else {
            parentProperties[field.name] = {
              ...field.config,
              title: field.label,
            };
          }

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

          const row = field.row || 0;
          if (!rowsMap[row]) rowsMap[row] = [];
          rowsMap[row].push(element);
        }
      });

      const sortedRows = Object.keys(rowsMap).sort((a, b) => Number(a) - Number(b));
      sortedRows.forEach(rowKey => {
        const rowElements = rowsMap[Number(rowKey)];
        if (rowElements.length === 1) {
          elements.push(rowElements[0]);
        } else if (rowElements.length > 1) {
          elements.push({
            type: 'HorizontalLayout',
            elements: rowElements,
          });
        }
      });

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
    const updateFieldRecursively = (fieldsList: FormField[]): FormField[] => {
      return fieldsList.map((f) => {
        if (f.id === updatedField.id) {
          return updatedField;
        }
        if (f.isContainer && f.children) {
          return {
            ...f,
            children: updateFieldRecursively(f.children),
          };
        }
        return f;
      });
    };

    setFields(updateFieldRecursively(fields));
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

  const handleSelectTemplate = (template: { name: string; description: string; fields: FormField[] }) => {
    if (fields.length > 0 && !confirm('Load template? Unsaved changes will be lost.')) {
      return;
    }
    setFormName(template.name);
    setFormDescription(template.description);
    setFields(template.fields);
    setCurrentFormId(null);
    setSelectedField(null);
    setActiveView('builder');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Builder</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Create dynamic forms with drag-and-drop
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <FormTemplates onSelectTemplate={handleSelectTemplate} />
              <button
                onClick={handleNewForm}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Form
              </button>
              <button
                onClick={handleSaveForm}
                disabled={isSaving || fields.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Form Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 w-fit">
            <button
              onClick={() => setActiveView('builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeView === 'builder'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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

          <div className="col-span-8 space-y-4">
            {activeView === 'builder' && fields.length === 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 How to arrange fields in rows
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5 list-disc list-inside">
                  <li>Drag fields from the palette on the left</li>
                  <li>Click the resize button (25%, 50%, 75%, 100%) to adjust field width</li>
                  <li>Fields smaller than 100% will automatically arrange side-by-side in rows</li>
                  <li>Drag fields between existing fields to reposition them</li>
                  <li>Blue drop zones appear when dragging to show where fields will be placed</li>
                </ul>
              </div>
            )}
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
