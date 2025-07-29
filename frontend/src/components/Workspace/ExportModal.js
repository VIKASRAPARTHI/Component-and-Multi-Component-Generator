import { useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { Dialog } from '@headlessui/react';

export default function ExportModal({ isOpen, onClose, component, session }) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState('zip');

  const handleCopy = async () => {
    try {
      const code = `${component.jsx}\n\n/* CSS */\n${component.css || ''}`;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    if (exportFormat === 'zip') {
      downloadAsZip();
    } else {
      downloadAsFiles();
    }
  };

  const downloadAsZip = () => {
    // Create a simple zip-like structure (in a real app, use JSZip)
    const files = {
      'Component.jsx': component.jsx || '',
      'Component.css': component.css || '',
      'package.json': JSON.stringify({
        name: session?.title?.toLowerCase().replace(/\s+/g, '-') || 'component',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0'
        }
      }, null, 2)
    };

    // Create and download blob
    const content = Object.entries(files)
      .map(([filename, content]) => `// ${filename}\n${content}`)
      .join('\n\n' + '='.repeat(50) + '\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session?.title || 'component'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsFiles = () => {
    // Download JSX file
    if (component.jsx) {
      const jsxBlob = new Blob([component.jsx], { type: 'text/javascript' });
      const jsxUrl = URL.createObjectURL(jsxBlob);
      const jsxLink = document.createElement('a');
      jsxLink.href = jsxUrl;
      jsxLink.download = 'Component.jsx';
      document.body.appendChild(jsxLink);
      jsxLink.click();
      document.body.removeChild(jsxLink);
      URL.revokeObjectURL(jsxUrl);
    }

    // Download CSS file
    if (component.css) {
      const cssBlob = new Blob([component.css], { type: 'text/css' });
      const cssUrl = URL.createObjectURL(cssBlob);
      const cssLink = document.createElement('a');
      cssLink.href = cssUrl;
      cssLink.download = 'Component.css';
      document.body.appendChild(cssLink);
      cssLink.click();
      document.body.removeChild(cssLink);
      URL.revokeObjectURL(cssUrl);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
              Export Component
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="zip"
                    checked={exportFormat === 'zip'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Single file (all code combined)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="separate"
                    checked={exportFormat === 'separate'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Separate files (JSX + CSS)
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                What&apos;s included:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• React component (JSX)</li>
                {component.css && <li>• CSS styles</li>}
                <li>• Package.json with dependencies</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
