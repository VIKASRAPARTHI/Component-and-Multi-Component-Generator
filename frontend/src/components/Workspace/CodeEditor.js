import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import useUIStore from '@/store/uiStore';
import useSessionStore from '@/store/sessionStore';

export default function CodeEditor({ value, language, onChange, readOnly = false }) {
  const editorRef = useRef(null);
  const { theme } = useUIStore();
  const { updateCurrentComponent, markUnsaved } = useSessionStore();

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save shortcut - handled by parent component
      console.log('Save shortcut pressed');
    });

    // Configure language-specific settings
    if (language === 'javascript') {
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      });

      // Add React types
      monaco.languages.typescript.javascriptDefaults.addExtraLib(`
        declare module 'react' {
          export interface FC<P = {}> {
            (props: P): JSX.Element | null;
          }
          export function useState<T>(initialState: T): [T, (value: T) => void];
          export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
          export function useRef<T>(initialValue: T): { current: T };
          export const Fragment: FC<{ children?: any }>;
        }
        
        declare global {
          namespace JSX {
            interface Element {}
            interface IntrinsicElements {
              [elemName: string]: any;
            }
          }
        }
      `, 'react.d.ts');
    }
  };

  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }

    // Auto-save to session store
    if (language === 'javascript') {
      updateCurrentComponent({ jsx: newValue });
    } else if (language === 'css') {
      updateCurrentComponent({ css: newValue });
    }

    markUnsaved();
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  const getDefaultValue = () => {
    if (!value) {
      if (language === 'javascript') {
        return `function MyComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Hello World!
      </h1>
      <p className="mt-2 text-gray-600">
        Start building your component here.
      </p>
    </div>
  );
}

export default MyComponent;`;
      } else if (language === 'css') {
        return `/* Add your custom CSS styles here */

.custom-component {
  /* Your styles */
}`;
      }
    }
    return value || '';
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={getLanguageForMonaco(language)}
        value={getDefaultValue()}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          readOnly,
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          automaticLayout: true,
          glyphMargin: false,
          folding: true,
          lineNumbers: 'on',
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
          },
        }}
        loading={
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      />
    </div>
  );
}
