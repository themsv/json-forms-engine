import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SchemaViewerProps {
  schema: any;
  uiSchema: any;
}

export default function SchemaViewer({ schema, uiSchema }: SchemaViewerProps) {
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedUISchema, setCopiedUISchema] = useState(false);

  const copyToClipboard = (text: string, type: 'schema' | 'uiSchema') => {
    navigator.clipboard.writeText(text);
    if (type === 'schema') {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } else {
      setCopiedUISchema(true);
      setTimeout(() => setCopiedUISchema(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">JSON Schema</h3>
          <button
            onClick={() => copyToClipboard(JSON.stringify(schema, null, 2), 'schema')}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
          >
            {copiedSchema ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">UI Schema</h3>
          <button
            onClick={() => copyToClipboard(JSON.stringify(uiSchema, null, 2), 'uiSchema')}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
          >
            {copiedUISchema ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto">
          {JSON.stringify(uiSchema, null, 2)}
        </pre>
      </div>
    </div>
  );
}
