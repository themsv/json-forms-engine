import { useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';

interface FormPreviewProps {
  schema: any;
  uiSchema: any;
}

export default function FormPreview({ schema, uiSchema }: FormPreviewProps) {
  const [formData, setFormData] = useState({});

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Form Preview</h3>
      <div className="space-y-4">
        <JsonForms
          schema={schema}
          uischema={uiSchema}
          data={formData}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data }) => setFormData(data)}
        />
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Form Data:</h4>
        <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
