import { useState, useEffect } from 'react';
import { Code, Eye, Download, Copy, Settings } from 'lucide-react';
import useSessionStore from '@/store/sessionStore';
import useUIStore from '@/store/uiStore';
import CodeEditor from './CodeEditor';
import ComponentPreview from './ComponentPreview';
import ExportModal from './ExportModal';

export default function WorkspaceView() {
  const { currentSession, getCurrentComponent } = useSessionStore();
  const { 
    activeTab, 
    setActiveTab, 
    previewPanelWidth, 
    setPreviewPanelWidth,
    modals,
    openModal,
    closeModal 
  } = useUIStore();

  const component = getCurrentComponent();

  const tabs = [
    { id: 'jsx', label: 'JSX', icon: Code },
    { id: 'css', label: 'CSS', icon: Code },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  const handleCopyCode = async () => {
    try {
      const code = activeTab === 'jsx' ? component.jsx : component.css;
      await navigator.clipboard.writeText(code || '');
      // Show success notification
    } catch (error) {
      // Show error notification
    }
  };

  if (!currentSession) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Code size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Session Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create a new session or select an existing one to start building components.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main content area */}
      <div 
        className="flex-1 flex flex-col bg-white dark:bg-gray-900"
        style={{ width: `calc(100% - ${previewPanelWidth}px)` }}
      >
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCode}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              title="Copy code"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => openModal('exportComponent')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              title="Export component"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => openModal('sessionSettings')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              title="Session settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'jsx' && (
            <CodeEditor
              value={component.jsx || ''}
              language="javascript"
              onChange={(value) => {
                // Update component JSX
              }}
            />
          )}
          {activeTab === 'css' && (
            <CodeEditor
              value={component.css || ''}
              language="css"
              onChange={(value) => {
                // Update component CSS
              }}
            />
          )}
          {activeTab === 'preview' && (
            <ComponentPreview
              jsx={component.jsx}
              css={component.css}
              props={component.props}
            />
          )}
        </div>
      </div>

      {/* Preview panel */}
      <div 
        className="border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ width: `${previewPanelWidth}px` }}
      >
        <div className="h-full flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Live Preview
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <ComponentPreview
              jsx={component.jsx}
              css={component.css}
              props={component.props}
            />
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize absolute left-0 top-0 h-full"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = previewPanelWidth;

            const handleMouseMove = (e) => {
              const newWidth = startWidth - (e.clientX - startX);
              setPreviewPanelWidth(newWidth);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      </div>

      {/* Export Modal */}
      {modals.exportComponent && (
        <ExportModal
          isOpen={modals.exportComponent}
          onClose={() => closeModal('exportComponent')}
          component={component}
          session={currentSession}
        />
      )}
    </div>
  );
}
