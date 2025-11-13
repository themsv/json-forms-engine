import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, schemaMatches } from '@jsonforms/core';

const TextDisplayControl = ({ schema }: any) => {
  const textType = schema?.textType || 'paragraph';
  const content = schema?.content || schema?.title || 'Text content';

  const renderText = () => {
    switch (textType) {
      case 'header':
        return (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            {content}
          </h1>
        );

      case 'subheader':
        return (
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-3">
            {content}
          </h2>
        );

      case 'paragraph':
        return (
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {content}
          </p>
        );

      default:
        return (
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {content}
          </p>
        );
    }
  };

  return (
    <div className="my-2">
      {renderText()}
    </div>
  );
};

export const textDisplayControlTester = rankWith(
  10,
  schemaMatches((schema) => schema.hasOwnProperty('textType'))
);

export default withJsonFormsControlProps(TextDisplayControl);
