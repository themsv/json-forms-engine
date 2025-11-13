import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, schemaMatches } from '@jsonforms/core';
import { useState } from 'react';
import { Upload, X, File } from 'lucide-react';

const FileUploadControl = ({ data, handleChange, path, label, required, schema }: any) => {
  const [fileName, setFileName] = useState<string>(data || '');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: globalThis.File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFileName(file.name);
        handleChange(path, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleClear = () => {
    setFileName('');
    handleChange(path, undefined);
  };

  const acceptTypes = schema?.accept || '*/*';

  return (
    <div className="my-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          onChange={handleInputChange}
          accept={acceptTypes}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id={`file-upload-${path}`}
        />

        {!fileName ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {acceptTypes === '*/*' ? 'Any file type' : acceptTypes}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <File className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{fileName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">File uploaded</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const fileUploadControlTester = rankWith(
  10,
  schemaMatches((schema) => schema.format === 'file')
);

export default withJsonFormsControlProps(FileUploadControl);
