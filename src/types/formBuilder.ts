export interface FieldType {
  id: string;
  label: string;
  type: string;
  icon: string;
  defaultConfig: {
    type: string;
    title?: string;
    description?: string;
    format?: string;
    enum?: string[];
    items?: any;
    properties?: any;
  };
}

export interface Condition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: any;
}

export type FieldSize = 'small' | 'medium' | 'large' | 'full';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  config: any;
  size?: FieldSize;
  isContainer?: boolean;
  children?: FormField[];
  visibility?: {
    enabled: boolean;
    condition?: Condition;
  };
  readonly?: {
    enabled: boolean;
    condition?: Condition;
  };
}

export const FIELD_TYPES: FieldType[] = [
  {
    id: 'text',
    label: 'Text Input',
    type: 'string',
    icon: 'Type',
    defaultConfig: {
      type: 'string',
      title: 'Text Field',
    },
  },
  {
    id: 'email',
    label: 'Email',
    type: 'string',
    icon: 'Mail',
    defaultConfig: {
      type: 'string',
      format: 'email',
      title: 'Email Address',
    },
  },
  {
    id: 'number',
    label: 'Number',
    type: 'number',
    icon: 'Hash',
    defaultConfig: {
      type: 'number',
      title: 'Number Field',
    },
  },
  {
    id: 'textarea',
    label: 'Text Area',
    type: 'string',
    icon: 'AlignLeft',
    defaultConfig: {
      type: 'string',
      title: 'Text Area',
    },
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    type: 'boolean',
    icon: 'CheckSquare',
    defaultConfig: {
      type: 'boolean',
      title: 'Checkbox',
    },
  },
  {
    id: 'date',
    label: 'Date',
    type: 'string',
    icon: 'Calendar',
    defaultConfig: {
      type: 'string',
      format: 'date',
      title: 'Date',
    },
  },
  {
    id: 'select',
    label: 'Dropdown',
    type: 'string',
    icon: 'ChevronDown',
    defaultConfig: {
      type: 'string',
      title: 'Dropdown',
      enum: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
];

export const WIDGET_TYPES: FieldType[] = [
  {
    id: 'section',
    label: 'Section',
    type: 'container',
    icon: 'Box',
    defaultConfig: {
      type: 'container',
      title: 'Section',
    },
  },
  {
    id: 'subsection',
    label: 'Subsection',
    type: 'container',
    icon: 'Square',
    defaultConfig: {
      type: 'container',
      title: 'Subsection',
    },
  },
];
