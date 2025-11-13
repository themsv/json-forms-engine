import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, schemaMatches } from '@jsonforms/core';

interface NavItem {
  label: string;
  url: string;
  active: boolean;
}

const NavControl = ({ schema }: any) => {
  const items = schema?.navItems || [
    { label: 'Home', url: '#', active: true },
    { label: 'About', url: '#', active: false },
    { label: 'Services', url: '#', active: false },
    { label: 'Contact', url: '#', active: false },
  ];
  const variant = schema?.navVariant || 'horizontal';

  if (variant === 'vertical') {
    return (
      <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 w-full mb-4">
        <ul className="space-y-1">
          {items.map((item: NavItem, index: number) => (
            <li key={index}>
              <a
                href={item.url}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 w-full mb-4">
      <ul className="flex flex-wrap gap-2">
        {items.map((item: NavItem, index: number) => (
          <li key={index}>
            <a
              href={item.url}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const navControlTester = rankWith(
  10,
  schemaMatches((schema) => schema.hasOwnProperty('navItems'))
);

export default withJsonFormsControlProps(NavControl);
