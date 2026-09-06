import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  Code, 
  FileCode2, 
  Quote, 
  List, 
  CheckSquare, 
  Table, 
  Link2, 
  Minus, 
  Columns, 
  Eye, 
  Edit3, 
  Copy, 
  Check, 
  Save, 
  X, 
  Sparkles,
  BookOpen,
  Maximize2,
  Minimize2,
  Focus
} from 'lucide-react';

interface MarkdownDocEditorProps {
  initialTitle: string;
  initialContent: string;
  folder: string;
  author: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  isNewDoc?: boolean;
}

type ViewMode = 'split' | 'edit' | 'preview';

export const MarkdownDocEditor: React.FC<MarkdownDocEditorProps> = ({
  initialTitle,
  initialContent,
  folder,
  author,
  onSave,
  onCancel,
  isNewDoc = false
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isCopiedDoc, setIsCopiedDoc] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard Shortcuts (Esc to exit focus mode, Ctrl/Cmd + S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
        setIsFocusMode(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(title, content);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, title, content, onSave]);

  // Statistics
  const wordsCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charsCount = content.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordsCount / 200));

  // Insert markdown helper at cursor
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const handleCopyDoc = () => {
    navigator.clipboard.writeText(content);
    setIsCopiedDoc(true);
    setTimeout(() => setIsCopiedDoc(false), 2000);
  };

  const handleCopyCodeSnippet = (snippetText: string, id: string) => {
    navigator.clipboard.writeText(snippetText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Lightweight custom markdown parser for preview
  const renderMarkdownPreview = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let codeBlockIndex = 0;

    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (keyIndex: number) => {
      if (tableRows.length === 0) return null;
      const headers = tableRows[0];
      const dataRows = tableRows.slice(1);
      
      const tableElem = (
        <div key={`table-${keyIndex}`} className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-200">
                {headers.map((h, i) => (
                  <th key={i} className="py-2 px-3 font-bold border-r border-slate-800 last:border-none">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 text-slate-300 border-r border-slate-800/40 last:border-none font-mono text-[11px]">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
      return tableElem;
    };

    lines.forEach((line, index) => {
      // Code Block Start/End
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '') || 'bash';
          codeBuffer = [];
          return;
        } else {
          inCodeBlock = false;
          const snippet = codeBuffer.join('\n');
          const snippetId = `code-${codeBlockIndex++}`;
          elements.push(
            <div key={snippetId} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="font-mono text-purple-300 ml-2">{codeLanguage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCodeSnippet(snippet, snippetId)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition bg-slate-800/60 px-2 py-0.5 rounded"
                >
                  {copiedCodeId === snippetId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                <code>{snippet}</code>
              </pre>
            </div>
          );
          return;
        }
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (line.includes('---')) {
          // delimiter row
          return;
        }
        inTable = true;
        tableRows.push(cells);
        return;
      } else if (inTable) {
        const table = flushTable(index);
        if (table) elements.push(table);
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl font-extrabold text-white mt-6 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
            <span className="text-purple-400 font-mono">#</span>
            <span>{line.replace('# ', '')}</span>
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-base font-bold text-slate-100 mt-5 mb-2 flex items-center gap-2">
            <span className="text-emerald-400 font-mono">##</span>
            <span>{line.replace('## ', '')}</span>
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-semibold text-purple-300 mt-4 mb-1.5 flex items-center gap-1.5">
            <span className="text-purple-500 font-mono">###</span>
            <span>{line.replace('### ', '')}</span>
          </h3>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="my-2.5 pl-3 py-1 border-l-2 border-purple-500 bg-purple-950/20 text-xs text-purple-200/90 italic rounded-r">
            {line.replace('> ', '')}
          </blockquote>
        );
        return;
      }

      // Task Checkboxes
      if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ')) {
        const isChecked = line.trim().startsWith('- [x] ');
        const taskText = line.trim().replace(/- \[[ x]\] /, '');
        elements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-xs text-slate-300">
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-700 bg-slate-900 text-transparent'}`}>
              {isChecked ? '✓' : ''}
            </span>
            <span className={isChecked ? 'line-through text-slate-500' : ''}>{taskText}</span>
          </div>
        );
        return;
      }

      // Bullet lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <div key={index} className="flex items-start gap-2 my-1 pl-2 text-xs text-slate-300">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>{parseInlineStyles(line.trim().substring(2))}</span>
          </div>
        );
        return;
      }

      // Horizontal Rule
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={index} className="my-4 border-slate-800" />);
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // Standard Paragraph with inline formatting
      elements.push(
        <p key={index} className="text-xs text-slate-300 leading-relaxed my-1.5">
          {parseInlineStyles(line)}
        </p>
      );
    });

    if (inTable) {
      const table = flushTable(lines.length);
      if (table) elements.push(table);
    }

    return elements;
  };

  // Inline formatting helper
  const parseInlineStyles = (text: string): React.ReactNode => {
    // Basic regex split for bold, code, tags
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|#[a-zA-Z0-9_-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('#')) {
        return (
          <span key={i} className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/50 mr-1">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={
      isFocusMode
        ? "fixed inset-0 z-50 bg-[#0a0d14] flex flex-col p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
        : "flex flex-col h-full bg-[#0d1117] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl"
    }>
      {/* Top Header Bar */}
      <div className={`${isFocusMode ? 'bg-[#111622] rounded-2xl border border-slate-800/90 shadow-xl mb-3' : 'bg-[#161b22] border-b border-slate-800'} px-4 py-2.5 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className={`w-8 h-8 rounded-xl ${isFocusMode ? 'bg-purple-900/40 border-purple-600' : 'bg-purple-950 border-purple-800'} border flex items-center justify-center text-purple-400 shrink-0`}>
            {isFocusMode ? <Focus className="w-4 h-4 text-purple-300 animate-pulse" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del documento o especificación..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 hidden sm:inline">
            {folder}
          </span>
          {isFocusMode && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/80 hidden md:inline">
              MODO FOCUS ACTIVO (ESC para salir)
            </span>
          )}
        </div>

        {/* View Mode Switcher + Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Focus mode toggle */}
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isFocusMode
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
            }`}
            title={isFocusMode ? 'Salir del Modo Focus (Esc)' : 'Activar Modo Focus (Zen / Distraction-free)'}
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-purple-400" />}
            <span className="hidden sm:inline">{isFocusMode ? 'Salir de Focus' : 'Modo Focus'}</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-xl flex items-center gap-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition ${
                viewMode === 'split' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista Dividida (Editor y Vista Previa)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dividido</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition ${
                viewMode === 'edit' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Solo Editor"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition ${
                viewMode === 'preview' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Solo Vista Previa"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Vista Previa</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyDoc}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Copiar contenido Markdown"
          >
            {isCopiedDoc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>

          <button
            type="button"
            onClick={() => onSave(title, content)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
            title="Guardar cambios (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isNewDoc ? 'Crear Documento' : 'Guardar (Ctrl+S)'}</span>
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      {viewMode !== 'preview' && (
        <div className="bg-[#12161f] border-b border-slate-800/90 px-3 py-1.5 flex items-center gap-1 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'texto en negrita')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Negrita (**texto**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'texto en cursiva')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Cursiva (*texto*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting('# ', '', 'Título Principal')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold"
            title="Encabezado H1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ', '', 'Sección Técnica')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold"
            title="Encabezado H2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ', '', 'Subsección')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold"
            title="Encabezado H3"
          >
            H3
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting('`', '`', 'variable')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Código Inline (`código`)"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('```bash\n', '\n```', '# Comando de compilación o script\n./gradlew assembleRelease')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Bloque de Código (```bash ... ```)"
          >
            <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ', '', 'Decisión técnica o nota de advertencia')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Cita / Callout (> cita)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting('- ', '', 'Punto de la lista')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Lista con viñetas (- item)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- [ ] ', '', 'Tarea pendiente')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Casilla de verificación (- [ ] tarea)"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('| Módulo | Responsable | Estado |\n|---|---|---|\n| Core Engine | Oscar Manuel | Operativo |\n| Shizuku Bridge | Dev Team | Validado |\n', '')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Insertar Tabla Markdown"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('[', '](https://github.com/ciber-store)', 'Enlace')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Insertar Enlace ([texto](url))"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n---\n', '')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Línea Divisoria (---)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Dual Workspace Pane */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Area */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'border-b md:border-b-0 md:border-r border-slate-800' : ''}`}>
            <div className="px-3 py-1 bg-[#161b22]/50 text-[10px] text-slate-400 font-mono flex items-center justify-between border-b border-slate-800/60">
              <span>ENTRADA RAW MARKDOWN</span>
              <span>UTF-8</span>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe la especificación técnica en Markdown..."
              className="flex-1 p-4 bg-[#0d1117] text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder-slate-600 selection:bg-purple-900 selection:text-purple-200"
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Preview Area */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-y-auto">
            <div className="px-3 py-1 bg-[#161b22]/50 text-[10px] text-purple-300 font-mono flex items-center justify-between border-b border-slate-800/60 sticky top-0 backdrop-blur z-10">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                VISTA PREVIA EN VIVO
              </span>
              <span>RENDERIZADOR TÉCNICO</span>
            </div>
            <div className="p-5 max-w-3xl mx-auto w-full">
              {renderMarkdownPreview(content)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status & Telemetry Bar */}
      <div className="bg-[#161b22] px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span>Palabras: <strong className="text-slate-200">{wordsCount}</strong></span>
          <span>Caracteres: <strong className="text-slate-200">{charsCount}</strong></span>
          <span>Lectura est.: <strong className="text-purple-300">{readingTimeMin} min</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Autor: {author}</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sincronización en tiempo real
          </span>
        </div>
      </div>
    </div>
  );
};
