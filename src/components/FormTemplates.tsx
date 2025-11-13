import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { FormField } from '../types/formBuilder';

interface FormTemplatesProps {
  onSelectTemplate: (template: { name: string; description: string; fields: FormField[] }) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FormField[];
}

const templates: Template[] = [
  {
    id: 'login',
    name: 'Login Form',
    description: 'Simple login form with email and password',
    icon: '🔐',
    fields: [
      {
        id: 'field_login_1',
        name: 'email',
        label: 'Email Address',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'email', title: 'Email Address' },
        size: 'full',
      },
      {
        id: 'field_login_2',
        name: 'password',
        label: 'Password',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'password', title: 'Password' },
        size: 'full',
      },
    ],
  },
  {
    id: 'signup',
    name: 'Signup Form',
    description: 'User registration form with essential fields',
    icon: '📝',
    fields: [
      {
        id: 'field_signup_1',
        name: 'firstName',
        label: 'First Name',
        type: 'string',
        required: true,
        config: { type: 'string', title: 'First Name' },
        size: 'medium',
      },
      {
        id: 'field_signup_2',
        name: 'lastName',
        label: 'Last Name',
        type: 'string',
        required: true,
        config: { type: 'string', title: 'Last Name' },
        size: 'medium',
      },
      {
        id: 'field_signup_3',
        name: 'email',
        label: 'Email Address',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'email', title: 'Email Address' },
        size: 'full',
      },
      {
        id: 'field_signup_4',
        name: 'password',
        label: 'Password',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'password', title: 'Password' },
        size: 'medium',
      },
      {
        id: 'field_signup_5',
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'password', title: 'Confirm Password' },
        size: 'medium',
      },
      {
        id: 'field_signup_6',
        name: 'agreeToTerms',
        label: 'I agree to the Terms and Conditions',
        type: 'boolean',
        required: true,
        config: { type: 'boolean', title: 'I agree to the Terms and Conditions' },
        size: 'full',
      },
    ],
  },
  {
    id: 'registration',
    name: 'Registration Form',
    description: 'Comprehensive registration with personal details',
    icon: '👤',
    fields: [
      {
        id: 'field_reg_1',
        name: 'fullName',
        label: 'Full Name',
        type: 'string',
        required: true,
        config: { type: 'string', title: 'Full Name' },
        size: 'full',
      },
      {
        id: 'field_reg_2',
        name: 'email',
        label: 'Email Address',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'email', title: 'Email Address' },
        size: 'medium',
      },
      {
        id: 'field_reg_3',
        name: 'phone',
        label: 'Phone Number',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'Phone Number' },
        size: 'medium',
      },
      {
        id: 'field_reg_4',
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'date', title: 'Date of Birth' },
        size: 'medium',
      },
      {
        id: 'field_reg_5',
        name: 'gender',
        label: 'Gender',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'Gender', enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
        size: 'medium',
      },
      {
        id: 'field_reg_6',
        name: 'address',
        label: 'Address',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'Address' },
        size: 'full',
      },
      {
        id: 'field_reg_7',
        name: 'city',
        label: 'City',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'City' },
        size: 'small',
      },
      {
        id: 'field_reg_8',
        name: 'state',
        label: 'State',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'State' },
        size: 'small',
      },
      {
        id: 'field_reg_9',
        name: 'zipCode',
        label: 'ZIP Code',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'ZIP Code' },
        size: 'small',
      },
    ],
  },
  {
    id: 'survey',
    name: 'Survey Form',
    description: 'Customer satisfaction survey template',
    icon: '📊',
    fields: [
      {
        id: 'field_survey_1',
        name: 'name',
        label: 'Your Name',
        type: 'string',
        required: true,
        config: { type: 'string', title: 'Your Name' },
        size: 'full',
      },
      {
        id: 'field_survey_2',
        name: 'email',
        label: 'Email Address',
        type: 'string',
        required: true,
        config: { type: 'string', format: 'email', title: 'Email Address' },
        size: 'full',
      },
      {
        id: 'field_survey_3',
        name: 'overallSatisfaction',
        label: 'Overall Satisfaction',
        type: 'number',
        required: true,
        config: { type: 'number', title: 'Overall Satisfaction', max: 5 },
        size: 'full',
      },
      {
        id: 'field_survey_4',
        name: 'serviceQuality',
        label: 'How would you rate our service quality?',
        type: 'string',
        required: true,
        config: {
          type: 'string',
          title: 'How would you rate our service quality?',
          enum: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
        },
        size: 'full',
      },
      {
        id: 'field_survey_5',
        name: 'recommendToFriend',
        label: 'Would you recommend us to a friend?',
        type: 'boolean',
        required: true,
        config: { type: 'boolean', title: 'Would you recommend us to a friend?' },
        size: 'full',
      },
      {
        id: 'field_survey_6',
        name: 'feedback',
        label: 'Additional Feedback',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'Additional Feedback' },
        size: 'full',
      },
      {
        id: 'field_survey_7',
        name: 'improvementSuggestions',
        label: 'What can we improve?',
        type: 'string',
        required: false,
        config: { type: 'string', title: 'What can we improve?' },
        size: 'full',
      },
    ],
  },
];

export default function FormTemplates({ onSelectTemplate }: FormTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate({
      name: template.name,
      description: template.description,
      fields: template.fields,
    });
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Templates
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Form Templates</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Choose a template to get started quickly</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 rounded-lg hover:bg-gray-100 dark:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="group text-left p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{template.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                          <span>{template.fields.length} fields</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
