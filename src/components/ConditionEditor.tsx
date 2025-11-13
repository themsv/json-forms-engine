import { Condition, FormField } from '../types/formBuilder';

interface ConditionEditorProps {
  condition: Condition | undefined;
  allFields: FormField[];
  currentFieldName: string;
  onChange: (condition: Condition | undefined) => void;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'isEmpty', label: 'Is Empty' },
  { value: 'isNotEmpty', label: 'Is Not Empty' },
];

export default function ConditionEditor({
  condition,
  allFields,
  currentFieldName,
  onChange,
}: ConditionEditorProps) {
  const availableFields = allFields.filter((f) => f.name !== currentFieldName);

  const handleFieldChange = (field: string) => {
    onChange({
      field,
      operator: condition?.operator || 'equals',
      value: condition?.value || '',
    });
  };

  const handleOperatorChange = (operator: string) => {
    if (!condition) return;
    onChange({
      ...condition,
      operator: operator as Condition['operator'],
    });
  };

  const handleValueChange = (value: any) => {
    if (!condition) return;
    onChange({
      ...condition,
      value,
    });
  };

  const needsValueInput = condition?.operator &&
    !['isEmpty', 'isNotEmpty'].includes(condition.operator);

  const selectedField = allFields.find((f) => f.name === condition?.field);
  const isBoolean = selectedField?.type === 'boolean';
  const hasEnum = selectedField?.config?.enum;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          When Field
        </label>
        <select
          value={condition?.field || ''}
          onChange={(e) => handleFieldChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a field...</option>
          {availableFields.map((field) => (
            <option key={field.name} value={field.name}>
              {field.label} ({field.name})
            </option>
          ))}
        </select>
      </div>

      {condition?.field && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Operator
            </label>
            <select
              value={condition.operator}
              onChange={(e) => handleOperatorChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {needsValueInput && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Value
              </label>
              {isBoolean ? (
                <select
                  value={String(condition.value)}
                  onChange={(e) => handleValueChange(e.target.value === 'true')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : hasEnum ? (
                <select
                  value={condition.value}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select value...</option>
                  {selectedField.config.enum.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : selectedField?.type === 'number' ? (
                <input
                  type="number"
                  value={condition.value}
                  onChange={(e) => handleValueChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
