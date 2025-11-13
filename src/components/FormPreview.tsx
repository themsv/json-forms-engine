import { useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import FileUploadRenderer, { fileUploadControlTester } from './FileUploadRenderer';
import ChartRenderer, { chartControlTester } from './ChartRenderer';
import TextDisplayRenderer, { textDisplayControlTester } from './TextDisplayRenderer';
import NavRenderer, { navControlTester } from './NavRenderer';
import SignatureControl, { signatureControlTester } from './SignatureControl';

interface FormPreviewProps {
  schema: any;
  uiSchema: any;
}

export default function FormPreview({ schema, uiSchema }: FormPreviewProps) {
  const [formData, setFormData] = useState({});

  const customRenderers = [
    ...materialRenderers,
    { tester: fileUploadControlTester, renderer: FileUploadRenderer },
    { tester: chartControlTester, renderer: ChartRenderer },
    { tester: textDisplayControlTester, renderer: TextDisplayRenderer },
    { tester: navControlTester, renderer: NavRenderer },
    { tester: signatureControlTester, renderer: SignatureControl },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Form Preview</h3>
      <div className="space-y-4">
        <JsonForms
          schema={schema}
          uischema={uiSchema}
          data={formData}
          renderers={customRenderers}
          cells={materialCells}
          onChange={({ data }) => setFormData(data)}
        />
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Form Data:</h4>
        <pre className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs overflow-x-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
