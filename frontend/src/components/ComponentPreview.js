'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

export default function ComponentPreview({ jsx, css, className = '' }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (jsx) {
      renderComponent();
    }
  }, [jsx, css]);

  const renderComponent = async () => {
    if (!jsx) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create the HTML content for the iframe
      const htmlContent = createPreviewHTML(jsx, css);
      
      // Update iframe content
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        iframe.srcdoc = htmlContent;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createPreviewHTML = (jsxCode, cssCode) => {
    // Transform JSX to a renderable format
    const transformedJSX = transformJSXForPreview(jsxCode);
    
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
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f9fafb;
            min-height: 100vh;
        }
        .preview-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .error-container {
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 16px;
            margin: 20px;
        }
        ${cssCode || ''}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef, useCallback, useMemo } = React;
        
        // Component code
        ${transformedJSX}
        
        // Render the component
        try {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(
                React.createElement('div', { className: 'preview-container' },
                    React.createElement(GeneratedComponent)
                )
            );
        } catch (error) {
            document.getElementById('root').innerHTML = 
                '<div class="error-container"><strong>Preview Error:</strong> ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;
  };

  const transformJSXForPreview = (jsxCode) => {
    // Basic transformation to make JSX work in the preview
    let transformed = jsxCode;
    
    // Remove import statements
    transformed = transformed.replace(/import.*?from.*?;?\n/g, '');
    
    // Replace export default with function declaration
    transformed = transformed.replace(/export\s+default\s+function\s+(\w+)/, 'function GeneratedComponent');
    transformed = transformed.replace(/export\s+default\s+(\w+)/, 'const GeneratedComponent = $1');
    
    // If no function is found, wrap the code
    if (!transformed.includes('function GeneratedComponent') && !transformed.includes('const GeneratedComponent')) {
      transformed = `function GeneratedComponent() { return (${transformed}); }`;
    }
    
    // Replace common icon imports with placeholder
    transformed = transformed.replace(/\{[^}]*\}\s*from\s*['"]lucide-react['"]/, '');
    transformed = transformed.replace(/\{[^}]*\}\s*from\s*['"]react-icons\/.*?['"]/, '');
    
    // Replace icon components with simple divs
    transformed = transformed.replace(/<(\w+Icon|[A-Z]\w*)\s*([^>]*)\s*\/>/g, '<div className="w-4 h-4 bg-gray-400 rounded" $2></div>');
    transformed = transformed.replace(/<(\w+Icon|[A-Z]\w*)\s*([^>]*)>.*?<\/\1>/g, '<div className="w-4 h-4 bg-gray-400 rounded" $2></div>');
    
    return transformed;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Listen for errors from the iframe
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        try {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            // Check for error messages in the iframe
            const errorElement = iframeDoc.querySelector('.error-container');
            if (errorElement) {
              setError('Component rendering failed. Please check your JSX syntax.');
            }
          }
        } catch (err) {
          // Cross-origin restrictions might prevent access
          console.warn('Cannot access iframe content:', err);
        }
      };
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!jsx) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Maximize2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Component to Preview
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Generate a component first to see the live preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Live Preview
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={renderComponent}
            disabled={isLoading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Rendering component...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center z-10">
            <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-medium text-red-900 dark:text-red-100">
                  Preview Error
                </h3>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          sandbox="allow-scripts allow-same-origin"
          title="Component Preview"
        />
      </div>
    </div>
  );
}
