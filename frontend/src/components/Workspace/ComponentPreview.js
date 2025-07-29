import { useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertTriangle, Smartphone, Tablet, Monitor } from 'lucide-react';

export default function ComponentPreview({ jsx, css, props = {} }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewportSize, setViewportSize] = useState('desktop');
  const iframeRef = useRef(null);

  const viewportSizes = {
    mobile: { width: 375, height: 667, icon: Smartphone },
    tablet: { width: 768, height: 1024, icon: Tablet },
    desktop: { width: '100%', height: '100%', icon: Monitor },
  };

  useEffect(() => {
    if (jsx) {
      renderComponent();
    }
  }, [jsx, css, props]);

  const renderComponent = async () => {
    if (!jsx || !iframeRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Create the HTML content
      const htmlContent = createPreviewHTML(jsx, css, props);

      // Write to iframe
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for iframe to load
      iframe.onload = () => {
        setIsLoading(false);
      };

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const createPreviewHTML = (jsxCode, cssCode, componentProps) => {
    // Transform JSX to executable JavaScript
    const transformedCode = transformJSX(jsxCode);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #f9fafb;
      min-height: 100vh;
    }
    .preview-container {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      min-height: calc(100vh - 32px);
    }
    .error-container {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      color: #dc2626;
    }
    ${cssCode || ''}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, Fragment } = React;
    
    try {
      ${transformedCode}
      
      const App = () => {
        return (
          <div className="preview-container">
            <MyComponent {...${JSON.stringify(componentProps)}} />
          </div>
        );
      };
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    } catch (error) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-container';
      errorDiv.innerHTML = \`
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
          Component Error
        </h3>
        <p style="margin: 0; font-size: 14px;">
          \${error.message}
        </p>
      \`;
      document.getElementById('root').appendChild(errorDiv);
    }
  </script>
</body>
</html>`;
  };

  const transformJSX = (jsxCode) => {
    // Basic JSX transformation - in a real app, you'd use a proper transformer
    let transformed = jsxCode;

    // Ensure the component is named MyComponent for consistency
    if (!transformed.includes('function MyComponent') && !transformed.includes('const MyComponent')) {
      // Try to extract component name and rename it
      const functionMatch = transformed.match(/function\s+(\w+)/);
      const constMatch = transformed.match(/const\s+(\w+)\s*=/);
      
      if (functionMatch) {
        transformed = transformed.replace(functionMatch[0], 'function MyComponent');
      } else if (constMatch) {
        transformed = transformed.replace(constMatch[0], 'const MyComponent =');
      }
    }

    // Remove export statements as they're not needed in the iframe
    transformed = transformed.replace(/export\s+default\s+\w+;?/g, '');
    transformed = transformed.replace(/export\s+\{[^}]+\};?/g, '');

    return transformed;
  };

  const handleRefresh = () => {
    renderComponent();
  };

  const getViewportStyle = () => {
    const size = viewportSizes[viewportSize];
    if (viewportSize === 'desktop') {
      return { width: '100%', height: '100%' };
    }
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
      margin: '0 auto',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
    };
  };

  if (!jsx) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Monitor size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Component to Preview
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Generate a component using the chat to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {Object.entries(viewportSizes).map(([size, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={size}
                onClick={() => setViewportSize(size)}
                className={`p-2 rounded-md transition-colors ${
                  viewportSize === size
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={`${size.charAt(0).toUpperCase() + size.slice(1)} view`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          title="Refresh preview"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-800">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Preview Error
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full" style={getViewportStyle()}>
            {isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Component Preview"
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
