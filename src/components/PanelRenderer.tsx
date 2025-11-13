import { useState } from 'react';
import { Minus, Maximize2, Minimize2, X, GripVertical } from 'lucide-react';

interface PanelRendererProps {
  title: string;
  children?: React.ReactNode;
  resizable?: boolean;
  collapsible?: boolean;
  initialState?: 'normal' | 'minimized' | 'maximized';
  onStateChange?: (state: 'normal' | 'minimized' | 'maximized') => void;
  onResize?: (width: string, height: string) => void;
  width?: string;
  height?: string;
}

export default function PanelRenderer({
  title,
  children,
  resizable = true,
  collapsible = true,
  initialState = 'normal',
  onStateChange,
  onResize,
  width = '100%',
  height = '400px',
}: PanelRendererProps) {
  const [panelState, setPanelState] = useState<'normal' | 'minimized' | 'maximized'>(initialState);
  const [panelSize, setPanelSize] = useState({ width, height });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMinimize = () => {
    const newState = panelState === 'minimized' ? 'normal' : 'minimized';
    setPanelState(newState);
    onStateChange?.(newState);
  };

  const handleMaximize = () => {
    const newState = panelState === 'maximized' ? 'normal' : 'maximized';
    setPanelState(newState);
    onStateChange?.(newState);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!resizable) return;
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: parseInt(panelSize.width) || 400,
      height: parseInt(panelSize.height) || 400,
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newWidth = Math.max(200, resizeStart.width + deltaX);
    const newHeight = Math.max(150, resizeStart.height + deltaY);

    const newSize = {
      width: `${newWidth}px`,
      height: `${newHeight}px`,
    };
    setPanelSize(newSize);
    onResize?.(newSize.width, newSize.height);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useState(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  });

  const panelClasses = panelState === 'maximized'
    ? 'fixed inset-4 z-50'
    : panelState === 'minimized'
    ? 'h-12'
    : '';

  const panelStyle = panelState === 'normal' && !isResizing
    ? { width: panelSize.width, height: panelSize.height }
    : panelState === 'normal'
    ? { width: panelSize.width, height: panelSize.height }
    : {};

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${panelClasses}`}
      style={panelStyle}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {collapsible && (
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              title={panelState === 'minimized' ? 'Restore' : 'Minimize'}
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleMaximize}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
            title={panelState === 'maximized' ? 'Restore' : 'Maximize'}
          >
            {panelState === 'maximized' ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {panelState !== 'minimized' && (
        <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 56px)' }}>
          {children || (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <p className="text-sm">Drop components here</p>
                <p className="text-xs mt-1">Charts, Tables, Dropdowns, etc.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {resizable && panelState === 'normal' && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors"
          style={{
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }}
        />
      )}
    </div>
  );
}
