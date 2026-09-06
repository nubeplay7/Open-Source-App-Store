import React, { useState } from 'react';
import { 
  BookOpen, 
  Kanban, 
  MessageSquare, 
  Compass, 
  History, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  Smile, 
  Code2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  Tag, 
  FileText, 
  Folder, 
  FolderOpen, 
  Download, 
  Share2, 
  Hash, 
  Lock, 
  User, 
  Bot, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Check,
  Flame,
  Zap,
  HelpCircle,
  BarChart3,
  GripVertical,
  Terminal,
  X
} from 'lucide-react';
import { 
  NotebookDocument, 
  JiraDevTask, 
  SlackDevChannel, 
  SlackDevMessage, 
  UserProfile, 
  TaskStatus, 
  TaskPriority, 
  TaskType,
  SystemChangelogEntry,
  SystemProposal,
  StoreUiMode
} from '../types';
import { MarkdownDocEditor } from './MarkdownDocEditor';
import { CiCdPerformanceSummary } from './CiCdPerformanceSummary';
import { INITIAL_BUILD_RUNS } from '../data/buildHistoryData';

interface CiberDevWorkspaceViewProps {
  userProfile: UserProfile;
  notebookDocs: NotebookDocument[];
  tasks: JiraDevTask[];
  channels: SlackDevChannel[];
  messages: SlackDevMessage[];
  changelogEntries: SystemChangelogEntry[];
  proposals: SystemProposal[];
  onUpdateNotebookDocs: (docs: NotebookDocument[]) => void;
  onUpdateTasks: (tasks: JiraDevTask[]) => void;
  onSendMessage: (msg: SlackDevMessage) => void;
  onPromoteTaskToChangelog: (task: JiraDevTask) => void;
  onSwitchUiMode: (mode: StoreUiMode) => void;
  onOpenCompiler: () => void;
  onOpenPublisher: () => void;
  onOpenCommandPalette?: () => void;
}

type WorkspaceTab = 'NOTEBOOK' | 'KANBAN' | 'SLACK' | 'VISION' | 'CHANGELOG_SYNC' | 'CICD_PERF';

export const CiberDevWorkspaceView: React.FC<CiberDevWorkspaceViewProps> = ({
  userProfile,
  notebookDocs,
  tasks,
  channels,
  messages,
  changelogEntries,
  proposals,
  onUpdateNotebookDocs,
  onUpdateTasks,
  onSendMessage,
  onPromoteTaskToChangelog,
  onSwitchUiMode,
  onOpenCompiler,
  onOpenPublisher,
  onOpenCommandPalette
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('NOTEBOOK');

  // Notebook state
  const [selectedDocId, setSelectedDocId] = useState<string>(notebookDocs[0]?.id || '');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [noteSearch, setNoteSearch] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newDocFolder, setNewDocFolder] = useState<NotebookDocument['folder']>('Arquitectura');
  const [newDocTitle, setNewDocTitle] = useState('');

  // Kanban state & Drag and Drop
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilterType, setTaskFilterType] = useState<string>('ALL');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('FEATURE');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('HIGH');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(5);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Slack state
  const [selectedChannelId, setSelectedChannelId] = useState<string>('chan-general');
  const [chatInput, setChatInput] = useState('');
  const [isCodeSnippetOpen, setIsCodeSnippetOpen] = useState(false);
  const [codeSnippetLang, setCodeSnippetLang] = useState('bash');
  const [codeSnippetText, setCodeSnippetText] = useState('');

  const selectedDoc = notebookDocs.find((d) => d.id === selectedDocId) || notebookDocs[0];
  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channelId === selectedChannelId);

  // Folder categories
  const folders: Array<NotebookDocument['folder']> = [
    'Arquitectura',
    'Roadmap 2026',
    'ADR (Decisiones)',
    'Seguridad & FOSS',
    'Sprints & Specs'
  ];

  // Filtered Notes
  const filteredDocs = notebookDocs.filter((doc) => {
    const matchesFolder = selectedFolder === 'ALL' || doc.folder === selectedFolder;
    const matchesSearch =
      !noteSearch ||
      doc.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      doc.content.toLowerCase().includes(noteSearch.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(noteSearch.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  // Handle Save Note from MarkdownDocEditor
  const handleSaveDocFromEditor = (title: string, content: string) => {
    if (!selectedDoc) return;
    const updated = notebookDocs.map((doc) =>
      doc.id === selectedDoc.id
        ? {
            ...doc,
            title,
            content,
            lastModified: 'Ahora (Editado en vivo)'
          }
        : doc
    );
    onUpdateNotebookDocs(updated);
    setIsEditingNote(false);
  };

  // Handle Create Note
  const handleCreateNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc: NotebookDocument = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      folder: newDocFolder,
      content: `# ${newDocTitle.trim()}\n\n> Documento técnico inicial registrado en el workspace de Civer App Store.\n\n## 1. Visión y Alcance\nDescribe aquí el propósito de este módulo o decisión de arquitectura.\n\n\`\`\`bash\n# Comandos asociados\n./gradlew test\n\`\`\`\n\n- [ ] Tarea inicial de validación\n- [ ] Revisión de seguridad FOSS`,
      lastModified: 'Ahora',
      author: userProfile.name,
      tags: ['#nuevo', '#spec', '#ciber-store'],
      linkedModules: ['app-core']
    };

    onUpdateNotebookDocs([newDoc, ...notebookDocs]);
    setSelectedDocId(newDoc.id);
    setNewDocTitle('');
    setIsNewDocModalOpen(false);
    setIsEditingNote(true);
  };

  // Move Task Status (Manual or Drag & Drop)
  const handleMoveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    onUpdateTasks(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      handleMoveTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  // Handle Create Task
  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const nextIndex = tasks.length + 101;
    const newTask: JiraDevTask = {
      id: `task-${Date.now()}`,
      key: `CIBER-${nextIndex}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Sin descripción adicional.',
      type: newTaskType,
      status: 'TODO',
      priority: newTaskPriority,
      assignee: userProfile.name,
      assigneeAvatar: 'bg-emerald-600',
      storyPoints: newTaskPoints,
      sprint: 'Sprint 4 (Dev Collaboration Hub)',
      tags: [`#${newTaskType.toLowerCase()}`, '#ciber-store'],
      createdAt: '2026-08-31'
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsNewTaskModalOpen(false);
  };

  // Handle Send Chat
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !codeSnippetText.trim()) return;

    const newMsg: SlackDevMessage = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannelId,
      senderName: userProfile.name,
      senderEmail: userProfile.email,
      senderAvatar: userProfile.avatarLetter || 'O',
      senderRole: 'Lead Architect',
      content: chatInput.trim(),
      timestamp: 'Ahora',
      codeSnippet: codeSnippetText.trim()
        ? {
            language: codeSnippetLang,
            code: codeSnippetText.trim()
          }
        : undefined,
      reactions: [],
      threadRepliesCount: 0
    };

    onSendMessage(newMsg);
    setChatInput('');
    setCodeSnippetText('');
    setIsCodeSnippetOpen(false);

    // Auto simulated Copilot trigger if user addresses AI or architecture
    if (chatInput.toLowerCase().includes('ai') || chatInput.toLowerCase().includes('copilot') || chatInput.toLowerCase().includes('arquitectura') || chatInput.toLowerCase().includes('plan')) {
      setTimeout(() => {
        const botReply: SlackDevMessage = {
          id: `msg-${Date.now() + 1}`,
          channelId: selectedChannelId,
          senderName: 'AI Copilot',
          senderEmail: 'agent@ciber.store',
          senderAvatar: '🤖',
          senderRole: 'AI Copilot',
          content: `Entendido, **${userProfile.name}**. He analizado tu mensaje y verifiqué la alineación con el roadmap de **Civer App Store**. Las directivas se encuentran archivadas en el *Notebook* y vinculadas al tablero *Jira* para su ejecución inmediata.`,
          timestamp: 'Hace un momento',
          reactions: [{ emoji: '🧠', count: 2, userReacted: true }],
          threadRepliesCount: 0,
          isBot: true
        };
        onSendMessage(botReply);
      }, 1000);
    }
  };

  // Kanban Columns
  const kanbanColumns: Array<{ status: TaskStatus; label: string; bg: string; border: string }> = [
    { status: 'BACKLOG', label: 'Backlog de Ideas', bg: 'bg-slate-900/60', border: 'border-slate-800' },
    { status: 'TODO', label: 'Planificado (To Do)', bg: 'bg-blue-950/20', border: 'border-blue-900/40' },
    { status: 'IN_PROGRESS', label: 'En Desarrollo', bg: 'bg-amber-950/20', border: 'border-amber-900/40' },
    { status: 'REVIEW', label: 'Code Review & Test', bg: 'bg-purple-950/20', border: 'border-purple-900/40' },
    { status: 'DONE', label: 'Completado & Verificado', bg: 'bg-emerald-950/20', border: 'border-emerald-900/40' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117] text-slate-100 font-sans">
      {/* Top Workspace Header */}
      <header className="sticky top-0 z-30 bg-[#161b22] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black shadow-md shadow-emerald-950">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">Civer Dev Workspace</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Obsidian • Jira • Slack
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Centro de ingeniería, planeación de notas y gobernanza colaborativa en tiempo real.
            </p>
          </div>
        </div>

        {/* Top Actions & Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onSwitchUiMode('ciber_store')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
          >
            <span>Ver Civer App Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSwitchUiMode('matrix_pro')}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <span>Matriz Pro</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs border border-emerald-400">
            {userProfile.avatarLetter}
          </div>
        </div>
      </header>

      {/* Workspace Secondary Navigation Tabs */}
      <div className="bg-[#161b22]/90 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('NOTEBOOK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'NOTEBOOK'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Obsidian Notebook</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-900/60 text-purple-200">
              {notebookDocs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('KANBAN')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'KANBAN'
                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Kanban className="w-4 h-4 text-blue-400" />
            <span>Tablero Jira</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-900/60 text-blue-200">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SLACK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'SLACK'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Dev Channels (Slack)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/60 text-emerald-200">
              5
            </span>
          </button>

          <button
            onClick={() => setActiveTab('VISION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'VISION'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Visión 2026-2027</span>
          </button>

          <button
            onClick={() => setActiveTab('CHANGELOG_SYNC')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'CHANGELOG_SYNC'
                ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4 text-teal-400" />
            <span>Registro de Cambios Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('CICD_PERF')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'CICD_PERF'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Rendimiento CI/CD</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-900/60 text-cyan-200 font-mono">
              GitHub Actions
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 flex items-center gap-1.5 transition text-xs font-semibold shadow-sm"
              title="Abrir Command Palette (Ctrl+K)"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Command Palette</span>
              <kbd className="px-1 py-0.2 rounded bg-purple-900 text-[10px] text-purple-200 border border-purple-700">
                Ctrl+K
              </kbd>
            </button>
          )}
          <div className="hidden lg:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync Bitácora Activo</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* ========================================================= */}
        {/* 1. OBSIDIAN NOTEBOOK TAB */}
        {/* ========================================================= */}
        {activeTab === 'NOTEBOOK' && (
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-105px)] overflow-hidden">
            {/* Sidebar / Tree */}
            <div className="w-full md:w-80 bg-[#161b22] border-r border-slate-800 flex flex-col shrink-0">
              {/* Search & New */}
              <div className="p-3 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                    <span>Notas & Specs</span>
                  </span>
                  <button
                    onClick={() => setIsNewDocModalOpen(true)}
                    className="p-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva</span>
                  </button>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    placeholder="Buscar notas, tags (#adr)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Folder Pills */}
              <div className="p-2 border-b border-slate-800 flex gap-1 overflow-x-auto">
                <button
                  onClick={() => setSelectedFolder('ALL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                    selectedFolder === 'ALL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Todas
                </button>
                {folders.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                      selectedFolder === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsEditingNote(false);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                      selectedDoc?.id === doc.id
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">
                        {doc.title}
                      </span>
                      {doc.isPinned && (
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {doc.folder}
                      </span>
                      <span>{doc.lastModified}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((t) => (
                        <span key={t} className="text-[10px] text-purple-300/80">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Editor / Preview */}
            <div className="flex-1 bg-[#0d1117] flex flex-col overflow-hidden">
              {selectedDoc ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <MarkdownDocEditor
                    key={selectedDoc.id}
                    initialTitle={selectedDoc.title}
                    initialContent={selectedDoc.content}
                    folder={selectedDoc.folder}
                    author={selectedDoc.author}
                    onSave={handleSaveDocFromEditor}
                    onCancel={() => setIsEditingNote(false)}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Selecciona una nota para ver o editar su documentación técnica.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. JIRA SPRINT KANBAN BOARD */}
        {/* ========================================================= */}
        {activeTab === 'KANBAN' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-105px)] overflow-hidden p-4 space-y-4">
            {/* Kanban Header & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#161b22] p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white">Sprint 4: Civer App Store Dev Collaboration Hub</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60">
                    28 Puntos de Historia
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Tablero de tareas ágiles con soporte Drag & Drop entre columnas, corrección de errores y ejecución del roadmap.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-950"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Tarea</span>
                </button>
              </div>
            </div>

            {/* Columns Grid with Drag & Drop */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 overflow-y-auto pb-4">
              {kanbanColumns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.status);
                const isOver = dragOverCol === col.status;

                return (
                  <div
                    key={col.status}
                    onDragOver={(e) => handleDragOver(e, col.status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.status)}
                    className={`flex flex-col rounded-2xl border p-3 transition-all duration-200 min-h-[400px] ${col.bg} ${
                      isOver ? 'ring-2 ring-blue-400 border-blue-500 bg-blue-950/40 shadow-lg' : col.border
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span>{col.label}</span>
                      </span>
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                      {colTasks.map((task) => {
                        const isBeingDragged = draggedTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className={`p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-sm space-y-2 cursor-grab active:cursor-grabbing select-none ${
                              isBeingDragged ? 'opacity-40 scale-95 border-dashed border-blue-400' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <GripVertical className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                                  {task.key}
                                </span>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  task.priority === 'CRITICAL'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                    : task.priority === 'HIGH'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                    : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>

                            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-4 h-4 rounded-full ${task.assigneeAvatar} text-[9px] text-white flex items-center justify-center font-bold`}>
                                  {task.assignee[0]}
                                </div>
                                <span className="truncate max-w-[80px]">{task.assignee}</span>
                              </div>
                              <span className="font-mono bg-slate-800 px-1 rounded">{task.storyPoints} pts</span>
                            </div>

                            {/* Quick Status Mover */}
                            <div className="pt-1 flex items-center justify-between gap-1">
                              <select
                                value={task.status}
                                onChange={(e) => handleMoveTaskStatus(task.id, e.target.value as TaskStatus)}
                                className="w-full py-1 px-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300 focus:outline-none"
                              >
                                <option value="BACKLOG">Backlog</option>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">Review</option>
                                <option value="DONE">Done</option>
                              </select>

                              {task.status === 'DONE' && !task.linkedChangelogVersion && (
                                <button
                                  onClick={() => onPromoteTaskToChangelog(task)}
                                  title="Promover al Registro de Cambios"
                                  className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-bold shrink-0 transition"
                                >
                                  + Changelog
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {colTasks.length === 0 && (
                        <div className="h-24 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] text-slate-500">
                          Arrastra tareas aquí
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. SLACK DEV CHANNELS TAB */}
        {/* ========================================================= */}
        {activeTab === 'SLACK' && (
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-105px)] overflow-hidden">
            {/* Channels Sidebar */}
            <div className="w-full md:w-72 bg-[#161b22] border-r border-slate-800 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-800 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Canales de Ingeniería
                </span>
                <p className="text-[11px] text-slate-400">Debate de arquitectura y alertas automáticas.</p>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => setSelectedChannelId(chan.id)}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between ${
                      selectedChannelId === chan.id
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="text-xs font-bold truncate">{chan.name}</span>
                    </div>
                    {chan.unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-bold">
                        {chan.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-slate-800 bg-[#0d1117]/60 text-xs text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>AI Copilot Activo</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>

            {/* Chat Stream & Composer */}
            <div className="flex-1 bg-[#0d1117] flex flex-col overflow-hidden">
              {/* Channel Header */}
              <div className="p-4 border-b border-slate-800 bg-[#161b22]/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">#{activeChannel.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeChannel.topic}</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeChannel.memberCount} desarrolladores</span>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {channelMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {msg.senderAvatar}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{msg.senderName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                          {msg.senderRole}
                        </span>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>

                      <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {msg.codeSnippet && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                          <pre>{msg.codeSnippet.code}</pre>
                        </div>
                      )}

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          {msg.reactions.map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-1"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-[10px] font-mono font-bold">{r.count}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-800 bg-[#161b22] space-y-2">
                {isCodeSnippetOpen && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Insertar Snippet de Código / Comando</span>
                      <select
                        value={codeSnippetLang}
                        onChange={(e) => setCodeSnippetLang(e.target.value)}
                        className="bg-slate-900 text-xs px-2 py-0.5 rounded border border-slate-800"
                      >
                        <option value="bash">Bash / Terminal</option>
                        <option value="kotlin">Kotlin / Android</option>
                        <option value="typescript">TypeScript</option>
                        <option value="yaml">GitHub Actions YAML</option>
                      </select>
                    </div>
                    <textarea
                      value={codeSnippetText}
                      onChange={(e) => setCodeSnippetText(e.target.value)}
                      placeholder="Pegar código aquí..."
                      rows={3}
                      className="w-full p-2 bg-slate-900 text-xs font-mono text-cyan-300 rounded border border-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCodeSnippetOpen(!isCodeSnippetOpen)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Insertar Código"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Escribe un mensaje en #${activeChannel.name} (menciona @AI para asistencia)...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. VISION & STRATEGIC ROADMAP 2026-2027 */}
        {/* ========================================================= */}
        {activeTab === 'VISION' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Compass className="w-5 h-5" />
                  <span>Manifiesto de Visión Civer App Store (2026-2027)</span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Transformar la distribución de software Android hacia un modelo soberano, descentralizado y verificable sin depender de Google Play Services ni servicios propietarios.
                </p>
              </div>
            </div>

            {/* Strategic Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                  0%
                </div>
                <h4 className="text-sm font-bold text-white">Privacidad Absoluta</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cero IDs de publicidad de Google, cero SDKs de rastreo Exodus y conexiones protegidas mediante proxy Tor/Orbot.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
                  CI
                </div>
                <h4 className="text-sm font-bold text-white">Compilación Transparente</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verificación de código fuente reproducible con GitHub Actions y descarga directa de binarios auditados.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <h4 className="text-sm font-bold text-white">Ingeniería Viva</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gobernanza transparente donde cada propuesta de la comunidad y cada sprint se plasma en el Changelog inmutable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. CHANGELOG LIVE SYNC TAB */}
        {/* ========================================================= */}
        {activeTab === 'CHANGELOG_SYNC' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#161b22] border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-400" />
                  <span>Puente Bidireccional: Jira / Notebook → Changelog Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Las tareas completadas en Jira se convierten en registros oficiales verificados del sistema.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Historial de Versiones Registradas
              </h4>
              <div className="space-y-3">
                {changelogEntries.map((entry) => (
                  <div key={entry.iterationNumber} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Iteración #{entry.iterationNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white">{entry.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400">{entry.requestDate}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{entry.promptSummary || entry.executiveSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. CI/CD PERFORMANCE SUMMARY TAB */}
        {/* ========================================================= */}
        {activeTab === 'CICD_PERF' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <CiCdPerformanceSummary
              buildRuns={INITIAL_BUILD_RUNS}
              onTriggerNewBuild={() => {
                onOpenCompiler();
              }}
            />
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODALS: NEW DOC & NEW TASK */}
      {/* ========================================================= */}

      {/* New Doc Modal */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Crear Nueva Nota / Especificación</h3>
            <form onSubmit={handleCreateNewDoc} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Título del Documento</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Ej: ADR-005: Caché Descentralizado P2P"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Carpeta / Categoría</label>
                <select
                  value={newDocFolder}
                  onChange={(e) => setNewDocFolder(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {folders.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Crear Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Kanban className="w-4 h-4 text-blue-400" />
                  <span>Crear Tarea en Tablero Jira</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Define requerimientos, criterios de aceptación y asignación técnica</p>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Templates Buttons */}
            <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Plantillas Rápidas Jira:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewTaskTitle('Fix: Corregir fallo de verificación de checksum en descargas concurrentes');
                    setNewTaskType('BUG');
                    setNewTaskPriority('HIGH');
                    setNewTaskPoints(5);
                    setNewTaskDesc('**Pasos para reproducir:**\n1. Iniciar 3 descargas simultáneas en red 4G.\n2. Pausar la segunda descarga.\n\n**Comportamiento Esperado:**\nEl hash SHA-256 debe validarse contra el repositorio F-Droid upstream antes de solicitar la instalación.');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-[11px] font-semibold text-rose-300 transition"
                >
                  🐛 Bug Report
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskTitle('Feature: Soporte para verificación de firmas APK Scheme v4 (fs-verity)');
                    setNewTaskType('FEATURE');
                    setNewTaskPriority('HIGH');
                    setNewTaskPoints(8);
                    setNewTaskDesc('**Objetivo:**\nImplementar parseo de fs-verity metadata en Android 11+ para acelerar la instalación de APKs grandes sin lectura completa de I/O.\n\n**Criterios de Aceptación:**\n- Validar árbol de hashes en streaming.\n- Fallback transparente a Scheme v2/v3 en dispositivos antiguos.');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-[11px] font-semibold text-blue-300 transition"
                >
                  ✨ Nueva Feature
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskTitle('Security: Auditoría estática con Exodus Privacy y mitigación de rastreadores');
                    setNewTaskType('SECURITY');
                    setNewTaskPriority('CRITICAL');
                    setNewTaskPoints(5);
                    setNewTaskDesc('**Alcance de Seguridad:**\nEscanear todas las librerías dependientes en build.gradle.kts para asegurar que no se incluyan identificadores de publicidad GAID ni telemetría invasiva.');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-[11px] font-semibold text-emerald-300 transition"
                >
                  🛡️ Seguridad / Audit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskTitle('CI/CD: Optimizar cache Gradle en GitHub Actions runners');
                    setNewTaskType('OPTIMIZATION');
                    setNewTaskPriority('MEDIUM');
                    setNewTaskPoints(3);
                    setNewTaskDesc('**Mejora de Rendimiento:**\nImplementar `gradle/actions/setup-gradle@v3` con caching distribuido de dependencias para reducir el tiempo de compilación promedio a menos de 35 segundos.');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-800/80 text-[11px] font-semibold text-purple-300 transition"
                >
                  ⚡ Optimización CI
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Título de la Tarea</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ej: Integrar verificación de firmas APK Scheme v3"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tipo</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="FEATURE">Feature</option>
                    <option value="ARCHITECTURE">Arquitectura</option>
                    <option value="OPTIMIZATION">Optimización</option>
                    <option value="SECURITY">Seguridad</option>
                    <option value="BUG">Bug</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Prioridad</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="CRITICAL">Crítica</option>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Media</option>
                    <option value="LOW">Baja</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Puntos</label>
                  <input
                    type="number"
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                    min={1}
                    max={21}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Descripción / Criterios de Aceptación</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detalles de implementación técnica, requerimientos..."
                  rows={4}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-950"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
