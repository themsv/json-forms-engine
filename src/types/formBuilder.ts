export interface FieldType {
  id: string;
  label: string;
  type: string;
  icon: string;
  category?: string;
  defaultConfig: {
    type: string;
    title?: string;
    description?: string;
    format?: string;
    enum?: string[];
    items?: any;
    properties?: any;
    max?: number;
    accept?: string;
    columns?: any[];
    variant?: string;
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
  row?: number;
  column?: number;
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
  panelState?: 'normal' | 'minimized' | 'maximized';
  panelWidth?: string;
  panelHeight?: string;
}

export const FIELD_TYPES: FieldType[] = [
  {
    id: 'text',
    label: 'Text Input',
    type: 'string',
    icon: 'Type',
    category: 'Atoms',
    defaultConfig: {
      type: 'string',
      title: 'Text Field',
    },
  },
  {
    id: 'number',
    label: 'Number',
    type: 'number',
    icon: 'Hash',
    category: 'Atoms',
    defaultConfig: {
      type: 'number',
      title: 'Number Field',
    },
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    type: 'boolean',
    icon: 'CheckSquare',
    category: 'Atoms',
    defaultConfig: {
      type: 'boolean',
      title: 'Checkbox',
    },
  },
  {
    id: 'email',
    label: 'Email',
    type: 'string',
    icon: 'Mail',
    category: 'Molecules',
    defaultConfig: {
      type: 'string',
      format: 'email',
      title: 'Email Address',
    },
  },
  {
    id: 'textarea',
    label: 'Text Area',
    type: 'string',
    icon: 'AlignLeft',
    category: 'Molecules',
    defaultConfig: {
      type: 'string',
      title: 'Text Area',
    },
  },
  {
    id: 'select',
    label: 'Dropdown',
    type: 'string',
    icon: 'ChevronDown',
    category: 'Molecules',
    defaultConfig: {
      type: 'string',
      title: 'Dropdown',
      enum: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    id: 'radio',
    label: 'Radio Group',
    type: 'string',
    icon: 'Circle',
    category: 'Molecules',
    defaultConfig: {
      type: 'string',
      title: 'Radio Group',
      enum: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    id: 'multiCheckbox',
    label: 'Multi-select Checkbox',
    type: 'array',
    icon: 'CheckSquare',
    category: 'Molecules',
    defaultConfig: {
      type: 'array',
      title: 'Multi-select Checkbox',
      items: {
        type: 'string',
        enum: ['Option 1', 'Option 2', 'Option 3'],
      },
      uniqueItems: true,
    },
  },
  {
    id: 'date',
    label: 'Date',
    type: 'string',
    icon: 'Calendar',
    category: 'Molecules',
    defaultConfig: {
      type: 'string',
      format: 'date',
      title: 'Date',
    },
  },
  {
    id: 'rating',
    label: 'Rating',
    type: 'number',
    icon: 'Star',
    category: 'Molecules',
    defaultConfig: {
      type: 'number',
      title: 'Rating',
      max: 5,
    },
  },
  {
    id: 'file',
    label: 'File Upload',
    type: 'string',
    icon: 'Upload',
    category: 'Molecules',
    defaultConfig: {
      type: 'string',
      format: 'file',
      title: 'File Upload',
      accept: '*/*',
    },
  },
  {
    id: 'signature',
    label: 'Signature',
    type: 'string',
    icon: 'PenTool',
    category: 'Molecules',
    defaultConfig: {
      type: 'string',
      format: 'signature',
      title: 'Signature',
    },
  },
  {
    id: 'table',
    label: 'Table',
    type: 'array',
    icon: 'Table',
    category: 'Organisms',
    defaultConfig: {
      type: 'array',
      title: 'Table',
      items: {
        type: 'object',
        properties: {},
      },
      columns: [
        { name: 'column1', label: 'Column 1', type: 'string' },
        { name: 'column2', label: 'Column 2', type: 'string' },
      ],
    },
  },
];

export const WIDGET_TYPES: FieldType[] = [
  {
    id: 'nav',
    label: 'Navigation',
    type: 'navigation',
    icon: 'Menu',
    category: 'Atoms',
    defaultConfig: {
      type: 'navigation',
      title: 'Navigation',
      items: [
        { label: 'Home', url: '#', active: true },
        { label: 'About', url: '#', active: false },
        { label: 'Services', url: '#', active: false },
        { label: 'Contact', url: '#', active: false },
      ],
      variant: 'horizontal',
    },
  },
  {
    id: 'header',
    label: 'Header',
    type: 'text',
    icon: 'Heading1',
    category: 'Atoms',
    defaultConfig: {
      type: 'text',
      title: 'Header Text',
      textType: 'header',
      content: 'This is a header',
    },
  },
  {
    id: 'subheader',
    label: 'Subheader',
    type: 'text',
    icon: 'Heading2',
    category: 'Atoms',
    defaultConfig: {
      type: 'text',
      title: 'Subheader Text',
      textType: 'subheader',
      content: 'This is a subheader',
    },
  },
  {
    id: 'paragraph',
    label: 'Paragraph',
    type: 'text',
    icon: 'Type',
    category: 'Atoms',
    defaultConfig: {
      type: 'text',
      title: 'Paragraph Text',
      textType: 'paragraph',
      content: 'This is a paragraph of text. You can use this to add descriptive content to your form.',
    },
  },
  {
    id: 'alert',
    label: 'Alert',
    type: 'display',
    icon: 'AlertCircle',
    category: 'Atoms',
    defaultConfig: {
      type: 'display',
      title: 'Alert',
      description: 'This is an alert message',
      variant: 'info',
    },
  },
  {
    id: 'badge',
    label: 'Badge',
    type: 'display',
    icon: 'Tag',
    category: 'Atoms',
    defaultConfig: {
      type: 'display',
      title: 'Badge',
      variant: 'default',
    },
  },
  {
    id: 'barChart',
    label: 'Bar Chart',
    type: 'chart',
    icon: 'BarChart3',
    category: 'Molecules',
    defaultConfig: {
      type: 'chart',
      title: 'Bar Chart',
      chartType: 'bar',
      data: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 },
      ],
    },
  },
  {
    id: 'lineChart',
    label: 'Line Chart',
    type: 'chart',
    icon: 'LineChart',
    category: 'Molecules',
    defaultConfig: {
      type: 'chart',
      title: 'Line Chart',
      chartType: 'line',
      data: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 },
      ],
    },
  },
  {
    id: 'pieChart',
    label: 'Pie Chart',
    type: 'chart',
    icon: 'PieChart',
    category: 'Molecules',
    defaultConfig: {
      type: 'chart',
      title: 'Pie Chart',
      chartType: 'pie',
      data: [
        { name: 'Category A', value: 400 },
        { name: 'Category B', value: 300 },
        { name: 'Category C', value: 300 },
        { name: 'Category D', value: 200 },
      ],
    },
  },
  {
    id: 'areaChart',
    label: 'Area Chart',
    type: 'chart',
    icon: 'Activity',
    category: 'Molecules',
    defaultConfig: {
      type: 'chart',
      title: 'Area Chart',
      chartType: 'area',
      data: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 },
      ],
    },
  },
  {
    id: 'section',
    label: 'Section',
    type: 'container',
    icon: 'Box',
    category: 'Organisms',
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
    category: 'Organisms',
    defaultConfig: {
      type: 'container',
      title: 'Subsection',
    },
  },
  {
    id: 'tabs',
    label: 'Tabs',
    type: 'container',
    icon: 'Layers',
    category: 'Organisms',
    defaultConfig: {
      type: 'container',
      title: 'Tabs',
    },
  },
  {
    id: 'panel',
    label: 'Panel',
    type: 'panel',
    icon: 'PanelTop',
    category: 'Organisms',
    defaultConfig: {
      type: 'panel',
      title: 'Panel',
      resizable: true,
      collapsible: true,
      initialState: 'normal',
    },
  },
];
