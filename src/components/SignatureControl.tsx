import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, schemaMatches } from '@jsonforms/core';
import SignatureRenderer from './SignatureRenderer';

const SignatureControl = ({ data, handleChange, path, label, required }: any) => {
  const handleSignatureChange = (signature: string) => {
    handleChange(path, signature);
  };

  return (
    <div className="my-4">
      <SignatureRenderer
        value={data}
        onChange={handleSignatureChange}
        label={label}
        required={required}
      />
    </div>
  );
};

export const signatureControlTester = rankWith(
  10,
  schemaMatches((schema) => schema.format === 'signature')
);

export default withJsonFormsControlProps(SignatureControl);
