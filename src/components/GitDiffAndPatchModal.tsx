import React, { useState } from 'react';
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  FileCode,
  Check,
  Download,
  Copy,
  Plus,
  Minus,
  X,
  Play,
  Share2,
  Terminal
} from 'lucide-react';
import { GitPatchItem } from '../types';
import { SAMPLE_GIT_PATCHES } from '../data/gitDiffData';

interface GitDiffAndPatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const GitDiffAndPatchModal: React.FC<GitDiffAndPatchModalProps> = ({
  isOpen,
  onClose,
  onAddToast
}) => {
  const [patches, setPatches] = useState<GitPatchItem[]>(SAMPLE_GIT_PATCHES);
  const [selectedPatchIndex, setSelectedPatchIndex] = useState(0);
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPatch = patches[selectedPatchIndex] || patches[0];

  const handleApplyPatch = (patchId: string) => {
    setPatches((prev) =>
      prev.map((p) => (p.id === patchId ? { ...p, status: 'APPLIED' } : p))
    );
    if (onAddToast) {
      onAddToast('Parche Aplicado', `Parche ${patchId} aplicado al árbol de trabajo local`, 'success');
    }
  };

  const handleExportPatch = (patch: GitPatchItem) => {
    const rawPatch = patch.files
      .map((f) => `diff --git a/${f.filePath} b/${f.filePath}\n${f.diffHunks.join('\n')}`)
      .join('\n\n');
    const blob = new Blob([rawPatch], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patch.id}-${patch.title.slice(0, 20).replace(/\s+/g, '_')}.patch`;
    a.click();
    URL.revokeObjectURL(url);
    if (onAddToast) {
      onAddToast('Parche Exportado', `Archivo .patch generado correctamente`, 'info');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-950/80 border border-pink-700/60 rounded-xl text-pink-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Visor de Diff Git & Gestor de Parches .patch
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-800">
                  FOSS Patch Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aplica y exporta parches locales para repositorios clonados antes de compilar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Patches List */}
          <div className="w-full md:w-80 bg-slate-950/80 border-r border-slate-800 flex flex-col overflow-y-auto p-3 space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2">
              Parches Disponibles ({patches.length})
            </div>

            {patches.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatchIndex(idx)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedPatchIndex === idx
                    ? 'bg-pink-950/60 border-pink-700/70 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[10px] text-pink-400 font-bold">{p.id}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      p.status === 'APPLIED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-100 line-clamp-2">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{p.author}</span>
                  <span>{p.files.length} archivo(s)</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right Diff Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Action Bar */}
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">{currentPatch.title}</h4>
                <p className="text-xs text-slate-400">{currentPatch.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPatch(currentPatch)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-pink-400" />
                  <span>Descargar .patch</span>
                </button>
                <button
                  onClick={() => handleApplyPatch(currentPatch.id)}
                  disabled={currentPatch.status === 'APPLIED'}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    currentPatch.status === 'APPLIED'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 cursor-default'
                      : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{currentPatch.status === 'APPLIED' ? 'Parche Aplicado' : 'Aplicar al Código'}</span>
                </button>
              </div>
            </div>

            {/* Diff Hunks Display */}
            <div className="flex-1 overflow-auto p-4 space-y-4 font-mono text-xs">
              {currentPatch.files.map((file) => (
                <div key={file.filePath} className="bg-[#0b101c] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <FileCode className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-white font-semibold">{file.filePath}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-400 font-bold">+{file.additions}</span>
                      <span className="text-rose-400 font-bold">-{file.deletions}</span>
                    </div>
                  </div>

                  <div className="p-3 text-slate-300 leading-relaxed overflow-x-auto">
                    {file.diffHunks.map((hunk, hIdx) => (
                      <pre key={hIdx} className="whitespace-pre font-mono text-[11px]">
                        {hunk.split('\n').map((line, lIdx) => {
                          let lineStyle = 'text-slate-400';
                          if (line.startsWith('+') && !line.startsWith('+++')) {
                            lineStyle = 'text-emerald-300 bg-emerald-950/40 px-1 rounded block';
                          } else if (line.startsWith('-') && !line.startsWith('---')) {
                            lineStyle = 'text-rose-300 bg-rose-950/40 px-1 rounded block';
                          } else if (line.startsWith('@@')) {
                            lineStyle = 'text-sky-400 font-bold block my-1';
                          }
                          return (
                            <span key={lIdx} className={lineStyle}>
                              {line}
                            </span>
                          );
                        })}
                      </pre>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Compatible con standard unified diff (`git apply --check`)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
