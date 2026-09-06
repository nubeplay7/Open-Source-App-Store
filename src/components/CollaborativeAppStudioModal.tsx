import React, { useState, useEffect } from 'react';
import {
  Code2,
  GitBranch,
  GitCommit as GitCommitIcon,
  GitPullRequest,
  GitMerge,
  RotateCcw,
  Users,
  Play,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  FolderTree,
  Eye,
  ShieldCheck,
  Plus,
  X,
  Radio,
  ArrowRight,
  UploadCloud,
  DownloadCloud,
  Layers,
  Sparkles,
  Terminal
} from 'lucide-react';
import { CollabAppProject, GitCommit, CollabCollaborator, CollabProjectFile, UserProfile } from '../types';
import { collaborativeStudioService } from '../services/collaborativeStudioService';

interface CollaborativeAppStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onAddToast?: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const CollaborativeAppStudioModal: React.FC<CollaborativeAppStudioModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onAddToast
}) => {
  const [project, setProject] = useState<CollabAppProject>(collaborativeStudioService.getActiveProject());
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [editorContent, setEditorContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'EDITOR' | 'GIT_HISTORY' | 'BRANCHES' | 'COLLABORATORS'>('EDITOR');

  // Git Commit Drawer state
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [signWithGpg, setSignWithGpg] = useState(true);

  // New Branch state
  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // New Collaborator state
  const [isAddCollabModalOpen, setIsAddCollabModalOpen] = useState(false);
  const [collabName, setCollabName] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabRole, setCollabRole] = useState<'OWNER' | 'EDITOR' | 'REVIEWER'>('EDITOR');

  useEffect(() => {
    const unsub = collaborativeStudioService.subscribe(() => {
      const currentProj = collaborativeStudioService.getActiveProject();
      setProject(currentProj);
      if (currentProj.files[activeFileIndex]) {
        setEditorContent(currentProj.files[activeFileIndex].content);
      }
    });
    return unsub;
  }, [activeFileIndex]);

  useEffect(() => {
    if (project?.files[activeFileIndex]) {
      setEditorContent(project.files[activeFileIndex].content);
    }
  }, [activeFileIndex, project?.id]);

  if (!isOpen || !project) return null;

  const currentFile = project.files[activeFileIndex] || project.files[0];

  const handleCodeChange = (newCode: string) => {
    setEditorContent(newCode);
    collaborativeStudioService.updateFileContent(
      project.id,
      currentFile.path,
      newCode,
      userProfile.name || 'Oscar Manuel'
    );
  };

  const handleCommitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    const commit = collaborativeStudioService.commit(
      project.id,
      commitMessage.trim(),
      userProfile.name || 'Oscar Manuel',
      userProfile.email || 'nubeplay7@gmail.com',
      signWithGpg
    );

    setCommitMessage('');
    setIsCommitModalOpen(false);

    if (onAddToast) {
      onAddToast({
        title: 'Commit Creado y Registrado',
        description: `[${commit.shortHash}] "${commit.message}" con firma criptográfica ${signWithGpg ? 'Ed25519' : 'Estándar'}.`,
        type: 'success'
      });
    }
  };

  const handlePull = () => {
    const res = collaborativeStudioService.pull(project.id);
    if (onAddToast) {
      onAddToast({
        title: 'Git Pull Completado',
        description: res.message,
        type: 'success'
      });
    }
  };

  const handlePush = () => {
    const res = collaborativeStudioService.push(project.id);
    if (onAddToast) {
      onAddToast({
        title: 'Git Push a Origin',
        description: res.message,
        type: 'success'
      });
    }
  };

  const handleCheckoutCommit = (commit: GitCommit) => {
    if (confirm(`¿Deseas restaurar el código a la versión del commit [${commit.shortHash}] ("${commit.message}")?`)) {
      collaborativeStudioService.checkoutCommit(project.id, commit.hash);
      if (onAddToast) {
        onAddToast({
          title: `Código restaurado a [${commit.shortHash}]`,
          description: `Rollback ejecutado exitosamente. Ahora estás en el snapshot de "${commit.message}".`,
          type: 'info'
        });
      }
    }
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    collaborativeStudioService.createBranch(project.id, newBranchName.trim());
    setNewBranchName('');
    setIsNewBranchModalOpen(false);

    if (onAddToast) {
      onAddToast({
        title: 'Nueva rama Git creada',
        description: `Conmutado a la rama "${newBranchName.trim()}".`,
        type: 'success'
      });
    }
  };

  const handleAddCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabName.trim() || !collabEmail.trim()) return;

    collaborativeStudioService.addCollaborator(project.id, collabName.trim(), collabEmail.trim(), collabRole);
    setCollabName('');
    setCollabEmail('');
    setIsAddCollabModalOpen(false);

    if (onAddToast) {
      onAddToast({
        title: 'Colaborador Invitado al Proyecto',
        description: `"${collabName.trim()}" añadido con rol de ${collabRole}. Sincronización P2P en vivo activa.`,
        type: 'success'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh]">
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-700 text-white shadow-lg shadow-emerald-950">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">{project.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {project.version}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Google Docs/Sheets Style Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-lg">
                {project.description}
              </p>
            </div>
          </div>

          {/* Active Collaborators Presence in Top Bar */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="flex -space-x-2 overflow-hidden">
                {project.collaborators.map((c) => (
                  <div
                    key={c.userId}
                    title={`${c.name} (${c.role}) • Editando ${c.currentFile || 'código'}`}
                    style={{ borderColor: c.cursorColor }}
                    className={`w-7 h-7 rounded-full ${c.avatarBg} flex items-center justify-center font-bold text-[10px] text-white border-2`}
                  >
                    {c.avatarLetter}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {project.collaborators.length} en vivo
              </span>
            </div>

            <button
              onClick={() => setIsAddCollabModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-950"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invitar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Git & View Navigation Toolbar */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            {/* Branch Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={project.activeBranch}
                onChange={(e) => collaborativeStudioService.switchBranch(project.id, e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                {project.branches.map((b) => (
                  <option key={b} value={b} className="bg-slate-900 text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewBranchModalOpen(true)}
              title="Crear nueva rama Git"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-slate-800 mx-1" />

            {/* Git Action Buttons */}
            <button
              onClick={handlePull}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pull</span>
            </button>

            <button
              onClick={handlePush}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
              <span>Push</span>
            </button>

            <button
              onClick={() => setIsCommitModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm"
            >
              <GitCommitIcon className="w-3.5 h-3.5" />
              <span>Commit ({project.hasUncommittedChanges ? 'Modificado' : 'Limpio'})</span>
            </button>
          </div>

          {/* Right Sub-Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('EDITOR')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'EDITOR' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Editor & Vista Previa</span>
            </button>
            <button
              onClick={() => setActiveTab('GIT_HISTORY')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'GIT_HISTORY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Historial & Rollback ({project.commits.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('COLLABORATORS')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'COLLABORATORS' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Equipo ({project.collaborators.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'EDITOR' && (
            <>
              {/* File Tree Left Sidebar */}
              <div className="w-56 sm:w-64 bg-slate-950/70 border-r border-slate-800 flex flex-col justify-between shrink-0">
                <div className="p-3 space-y-3 overflow-y-auto">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <span>EXPLORADOR DE ARCHIVOS</span>
                    <FolderTree className="w-3.5 h-3.5" />
                  </div>

                  <div className="space-y-1">
                    {project.files.map((file, idx) => (
                      <button
                        key={file.path}
                        onClick={() => setActiveFileIndex(idx)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition font-mono ${
                          activeFileIndex === idx
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{file.path}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Peer Presence indicator on active file */}
                <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">EDITORES ACTIVOS</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold text-xs truncate">Sofia Lin & Tú editando</span>
                  </div>
                </div>
              </div>

              {/* Center: Interactive Code Editor Pane */}
              <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden border-r border-slate-800">
                <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{currentFile.path}</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Última edición por {currentFile.lastEditedBy}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{currentFile.language}</span>
                  </div>
                </div>

                {/* Simulated Real-Time Collaborative Cursor tags */}
                <div className="relative flex-1 flex flex-col">
                  {/* Floating peer badges */}
                  <div className="absolute top-4 right-6 z-10 flex items-center gap-2 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-600 text-amber-300 text-[10px] font-mono shadow-lg animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Sofia Lin (editando dspEngine.ts)</span>
                    </div>
                  </div>

                  <textarea
                    value={editorContent}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    spellCheck={false}
                    className="w-full flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Right: Live Interactive App Preview */}
              <div className="hidden lg:flex w-96 flex-col bg-slate-900/90 overflow-hidden shrink-0">
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Vista Previa en Tiempo Real</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Live HMR
                  </span>
                </div>

                {/* Preview Canvas */}
                <div className="flex-1 p-5 overflow-y-auto flex flex-col items-center justify-center bg-slate-950/40">
                  <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        DSP 96kHz Lossless
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="w-full h-36 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-950 flex flex-col items-center justify-center border border-indigo-700/40 shadow-inner text-center p-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-2">
                        <Play className="w-5 h-5 text-emerald-400 ml-0.5" />
                      </div>
                      <p className="text-xs font-bold text-slate-100">01 - Synthwave Resonance</p>
                      <p className="text-[10px] text-slate-400 font-mono">Hi-Res Direct Stream</p>
                    </div>

                    {/* Equalizer Frequency Visualization */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Ecualizador Paramétrico (Sofia Lin)</span>
                      <div className="flex items-end justify-between h-10 gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                        {[40, 65, 85, 95, 70, 50, 60, 80, 90, 75].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center leading-relaxed font-sans">
                      Los cambios de código se compilan y renderizan en vivo instantáneamente para todos los colaboradores conectados.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: GIT COMMIT HISTORY & TIME-TRAVEL ROLLBACK */}
          {activeTab === 'GIT_HISTORY' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <RotateCcw className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">Historial de Commits & Motor de Rollback Git</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Visualiza la línea de tiempo completa del proyecto. Cada commit incluye la firma criptográfica del autor y diffs de código. Puedes regresar en el tiempo y restaurar el código a cualquier punto con 1 toque.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {project.commits.map((commit, idx) => (
                  <div
                    key={commit.hash}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                          <GitCommitIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{commit.message}</span>
                            {commit.isSignedGpg && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                {commit.gpgKeyId || 'GPG VERIFIED'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Por <span className="text-slate-200 font-semibold">{commit.authorName}</span> ({commit.authorEmail}) • {new Date(commit.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-400 font-mono text-xs font-bold border border-slate-800">
                          {commit.shortHash}
                        </span>
                        <button
                          onClick={() => handleCheckoutCommit(commit)}
                          className="px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-amber-300 font-bold text-xs transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar / Checkout</span>
                        </button>
                      </div>
                    </div>

                    {/* Diffs snippet */}
                    {commit.diffs && commit.diffs.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span>Archivos modificados: {commit.filesChanged.join(', ')}</span>
                          <span className="text-emerald-400">+{commit.diffs[0].additions} / -{commit.diffs[0].deletions}</span>
                        </div>
                        <pre className="text-emerald-300 whitespace-pre overflow-x-auto text-[10px]">{commit.diffs[0].patch}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COLLABORATORS TEAM */}
          {activeTab === 'COLLABORATORS' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Equipo de Desarrollo en Tiempo Real</h3>
                  <p className="text-xs text-slate-400">Control de accesos y roles en el repositorio Git del proyecto</p>
                </div>
                <button
                  onClick={() => setIsAddCollabModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invitar Colaborador</span>
                </button>
              </div>

              <div className="space-y-3">
                {project.collaborators.map((collab) => (
                  <div
                    key={collab.userId}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${collab.avatarBg} flex items-center justify-center font-bold text-sm text-white`}>
                        {collab.avatarLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{collab.name}</h4>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-900 text-emerald-400 border border-slate-700">
                            {collab.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{collab.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        En Línea
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL 1: GIT COMMIT */}
        {isCommitModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GitCommitIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Crear Nuevo Commit Git</h3>
                </div>
                <button onClick={() => setIsCommitModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCommitSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mensaje del Commit</label>
                  <input
                    type="text"
                    placeholder="Ej. feat(audio): Optimizar buffer de latencia en Android 15"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">ARCHIVOS INCLUIDOS EN ESTE COMMIT</span>
                  <div className="space-y-1">
                    {project.files.map((f) => (
                      <div key={f.path} className="flex items-center justify-between text-slate-300 text-xs font-mono">
                        <span>{f.path}</span>
                        <span className="text-emerald-400 font-bold">Staged</span>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signWithGpg}
                    onChange={(e) => setSignWithGpg(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Firmar commit criptográficamente con clave Ed25519 Civer ID</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-950"
                >
                  Confirmar y Guardar Commit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: NEW BRANCH */}
        {isNewBranchModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Crear Nueva Rama Git</h3>
                </div>
                <button onClick={() => setIsNewBranchModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBranch} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Rama</label>
                  <input
                    type="text"
                    placeholder="feature/nueva-funcionalidad"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-950"
                >
                  Crear y Conmutar a Rama
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD COLLABORATOR */}
        {isAddCollabModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Invitar Colaborador en Tiempo Real</h3>
                </div>
                <button onClick={() => setIsAddCollabModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCollab} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre o Alias</label>
                  <input
                    type="text"
                    placeholder="Ej. Martin Hacker"
                    value={collabName}
                    onChange={(e) => setCollabName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico / Civer ID</label>
                  <input
                    type="email"
                    placeholder="martin@civer.id"
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Rol en el Proyecto</label>
                  <select
                    value={collabRole}
                    onChange={(e) => setCollabRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EDITOR">Editor en Tiempo Real (Escritura y Commit)</option>
                    <option value="REVIEWER">Revisor (Lectura y Pull Requests)</option>
                    <option value="OWNER">Copropietario (Administración y Ramas)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-950"
                >
                  Conceder Acceso Colaborativo
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
