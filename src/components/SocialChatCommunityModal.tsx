import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Send,
  Share2,
  Sparkles,
  Paperclip,
  Code2,
  Smile,
  ShieldCheck,
  UserPlus,
  Search,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  X,
  FileCode,
  Tag,
  Radio,
  Star
} from 'lucide-react';
import { FriendUser, ChatMessage, ChatChannel, AppCatalogItem, UserProfile } from '../types';
import { socialNetworkService } from '../services/socialNetworkService';
import { APPS_CATALOG } from '../data/appsCatalogData';

interface SocialChatCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onOpenAppDetail?: (app: AppCatalogItem) => void;
  onAddToast?: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const SocialChatCommunityModal: React.FC<SocialChatCommunityModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenAppDetail,
  onAddToast
}) => {
  const [channels, setChannels] = useState<ChatChannel[]>(socialNetworkService.getChannels());
  const [friends, setFriends] = useState<FriendUser[]>(socialNetworkService.getFriends());
  const [activeChatType, setActiveChatType] = useState<'CHANNEL' | 'DM'>('CHANNEL');
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-general');
  const [activeFriendId, setActiveFriendId] = useState<string>('usr-linus');

  const [messageInput, setMessageInput] = useState('');
  const [isShareAppPickerOpen, setIsShareAppPickerOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<FriendUser | null>(null);

  // New Friend form
  const [friendName, setFriendName] = useState('');
  const [friendCiverId, setFriendCiverId] = useState('');
  const [friendEmail, setFriendEmail] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = socialNetworkService.subscribe(() => {
      setChannels(socialNetworkService.getChannels());
      setFriends(socialNetworkService.getFriends());
    });
    return unsub;
  }, []);

  const currentMessages = activeChatType === 'CHANNEL'
    ? socialNetworkService.getMessagesForChannel(activeChannelId)
    : socialNetworkService.getDirectMessages(activeFriendId, 'current-user');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeChannelId, activeFriendId]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    socialNetworkService.sendMessage({
      channelId: activeChatType === 'CHANNEL' ? activeChannelId : undefined,
      recipientUserId: activeChatType === 'DM' ? activeFriendId : undefined,
      senderId: 'current-user',
      senderName: userProfile.name || 'Tú',
      senderAvatar: userProfile.avatarLetter || 'T',
      senderRole: 'Usuario Verificado',
      content: messageInput.trim(),
      reactions: []
    });

    setMessageInput('');
  };

  const handleShareApp = (app: AppCatalogItem, note?: string) => {
    socialNetworkService.shareAppToChat(
      app,
      {
        channelId: activeChatType === 'CHANNEL' ? activeChannelId : undefined,
        friendId: activeChatType === 'DM' ? activeFriendId : undefined
      },
      userProfile,
      note || `Recomiendo instalar ${app.name} (${app.version}) para Android.`
    );

    setIsShareAppPickerOpen(false);

    if (onAddToast) {
      onAddToast({
        title: 'Aplicación compartida en el chat',
        description: `Se adjuntó la ficha FOSS de ${app.name} con enlace de descarga.`,
        type: 'success'
      });
    }
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || !friendCiverId.trim()) return;

    const newFriend = socialNetworkService.addFriend({
      name: friendName.trim(),
      civerId: friendCiverId.trim(),
      email: friendEmail.trim() || `${friendCiverId.trim()}@foss.network`,
      roleBadge: 'Desarrollador FOSS'
    });

    setFriendName('');
    setFriendCiverId('');
    setFriendEmail('');
    setIsAddFriendOpen(false);
    setActiveChatType('DM');
    setActiveFriendId(newFriend.id);

    if (onAddToast) {
      onAddToast({
        title: 'Amigo agregado a tu red',
        description: `"${newFriend.name}" (${newFriend.civerId}) añadido a tu lista de contactos.`,
        type: 'success'
      });
    }
  };

  const currentChannel = channels.find((c) => c.id === activeChannelId);
  const currentFriend = friends.find((f) => f.id === activeFriendId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-950">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Comunidad & Red Social FOSS</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                  Canales & Mensajes Directos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Habla con amigos, comparte aplicaciones con 1-toque e intercambia configuraciones y código
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddFriendOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-950"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Agregar Amigo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Sidebar + Chat Area + Profile Drawer */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR: Channels and Friends List */}
          <div className="w-72 sm:w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col justify-between shrink-0">
            <div className="p-3 space-y-4 overflow-y-auto flex-1">
              {/* Channels Section */}
              <div className="space-y-1">
                <span className="px-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  CANALES DE LA COMUNIDAD
                </span>
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => {
                      setActiveChatType('CHANNEL');
                      setActiveChannelId(chan.id);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition ${
                      activeChatType === 'CHANNEL' && activeChannelId === chan.id
                        ? 'bg-indigo-950/70 text-white border border-indigo-700/80 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-500 font-mono text-sm">#</span>
                      <span className="truncate">{chan.name}</span>
                    </div>
                    {chan.unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        {chan.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Friends & Contacts Section */}
              <div className="space-y-1 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    AMIGOS & CONTACTOS ({friends.length})
                  </span>
                  <button
                    onClick={() => setIsAddFriendOpen(true)}
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Añadir</span>
                  </button>
                </div>

                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => {
                      setActiveChatType('DM');
                      setActiveFriendId(friend.id);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      activeChatType === 'DM' && activeFriendId === friend.id
                        ? 'bg-indigo-950/70 text-white border border-indigo-700/80 font-bold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full ${friend.avatarBg} flex items-center justify-center font-bold text-xs text-white`}>
                          {friend.avatarLetter}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                            friend.status === 'ONLINE'
                              ? 'bg-emerald-400'
                              : friend.status === 'AWAY'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate leading-tight">{friend.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{friend.roleBadge}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFriendProfile(friend);
                      }}
                      title="Ver Perfil"
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current user mini-status in footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-slate-950">
                  {userProfile.avatarLetter || 'T'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{userProfile.name || 'Tú'}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">En Línea • Civer ID</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* CENTER: Chat messages & Input */}
          <div className="flex-1 flex flex-col justify-between bg-slate-900/90 overflow-hidden">
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {activeChatType === 'CHANNEL' ? (
                  <>
                    <span className="text-lg font-bold text-indigo-400 font-mono">#</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{currentChannel?.name}</h3>
                      <p className="text-[11px] text-slate-400">{currentChannel?.description}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-8 h-8 rounded-full ${currentFriend?.avatarBg} flex items-center justify-center font-bold text-xs text-white`}>
                      {currentFriend?.avatarLetter}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{currentFriend?.name}</h3>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-800">
                          {currentFriend?.civerId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{currentFriend?.customStatusMessage}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareAppPickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 transition border border-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir App</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-2 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-400">No hay mensajes todavía en esta conversación.</p>
                  <p className="text-xs text-slate-500 mt-1">¡Sé el primero en escribir o comparte una app con tu amigo!</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isMe = msg.senderId === 'current-user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-start ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                          isMe ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                      >
                        {msg.senderAvatar}
                      </div>

                      <div className={`max-w-lg space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                          <span className="font-bold text-slate-300">{msg.senderName}</span>
                          {msg.senderRole && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {msg.senderRole}
                            </span>
                          )}
                          <span className="font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                          }`}
                        >
                          <p>{msg.content}</p>

                          {/* Embedded Shared App Card */}
                          {msg.sharedApp && (
                            <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-700/80 text-white space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-lg ${msg.sharedApp.iconBg} flex items-center justify-center text-xs font-bold`}>
                                    {msg.sharedApp.appName.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white">{msg.sharedApp.appName}</h4>
                                    <p className="text-[10px] text-slate-400 font-mono">{msg.sharedApp.packageName} • {msg.sharedApp.version}</p>
                                  </div>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-400 font-mono">
                                  {msg.sharedApp.apkSizeMb} MB
                                </span>
                              </div>

                              {msg.sharedApp.recommendationNote && (
                                <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 italic">
                                  "{msg.sharedApp.recommendationNote}"
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  <span>{msg.sharedApp.rating}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const fullApp = APPS_CATALOG.find((a: AppCatalogItem) => a.id === msg.sharedApp?.appId);
                                    if (fullApp && onOpenAppDetail) {
                                      onOpenAppDetail(fullApp);
                                    }
                                  }}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] transition flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Ver / Instalar</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Code Snippet Embed */}
                          {msg.codeSnippet && (
                            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                              <span className="text-[9px] text-slate-500 block mb-1 uppercase font-bold tracking-wider">
                                {msg.codeSnippet.title} ({msg.codeSnippet.language})
                              </span>
                              <pre className="whitespace-pre">{msg.codeSnippet.code}</pre>
                            </div>
                          )}
                        </div>

                        {/* Reactions row */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {msg.reactions.map((r) => (
                            <button
                              key={r.emoji}
                              onClick={() => socialNetworkService.toggleReaction(msg.id, r.emoji)}
                              className={`px-1.5 py-0.5 rounded-full text-[10px] border flex items-center gap-1 transition ${
                                r.userReacted
                                  ? 'bg-indigo-950 border-indigo-600 text-indigo-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span>{r.emoji}</span>
                              <span className="font-mono">{r.count}</span>
                            </button>
                          ))}
                          <button
                            onClick={() => socialNetworkService.toggleReaction(msg.id, '❤️')}
                            className="p-1 text-slate-500 hover:text-rose-400 text-xs transition"
                            title="Reaccionar"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsShareAppPickerOpen(true)}
                title="Compartir una app con tu contacto"
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={
                  activeChatType === 'CHANNEL'
                    ? `Enviar mensaje a #${currentChannel?.name}...`
                    : `Enviar mensaje a ${currentFriend?.name}...`
                }
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold transition shadow-md shadow-indigo-950"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* RIGHT DRAWER: Friend Profile Card (If selected) */}
          {selectedFriendProfile && (
            <div className="w-72 bg-slate-950 border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">PERFIL CIVER ID</span>
                  <button onClick={() => setSelectedFriendProfile(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <div className={`w-16 h-16 rounded-full ${selectedFriendProfile.avatarBg} flex items-center justify-center font-bold text-2xl text-white mx-auto shadow-lg`}>
                    {selectedFriendProfile.avatarLetter}
                  </div>
                  <h3 className="text-sm font-bold text-white">{selectedFriendProfile.name}</h3>
                  <p className="text-[11px] font-mono text-indigo-400">{selectedFriendProfile.civerId}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700">
                    {selectedFriendProfile.roleBadge}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Apps en común:</span>
                    <span className="font-bold text-emerald-400 font-mono">{selectedFriendProfile.mutualAppsCount} apps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estado P2P:</span>
                    <span className="font-bold text-slate-300 font-mono">{selectedFriendProfile.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">APPS PÚBLICAS COMPARTIDAS</span>
                  <div className="space-y-1.5">
                    {selectedFriendProfile.publicSharedApps.map((appId) => {
                      const app = APPS_CATALOG.find((a: AppCatalogItem) => a.id === appId);
                      return (
                        <div
                          key={appId}
                          onClick={() => app && onOpenAppDetail && onOpenAppDetail(app)}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center gap-2"
                        >
                          <div className={`w-6 h-6 rounded ${app?.iconBg || 'bg-slate-800'} flex items-center justify-center text-xs font-bold text-white`}>
                            {app?.name.charAt(0) || 'A'}
                          </div>
                          <span className="text-xs text-white truncate">{app?.name || appId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveChatType('DM');
                  setActiveFriendId(selectedFriendProfile.id);
                  setSelectedFriendProfile(null);
                }}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Abrir Mensaje Directo
              </button>
            </div>
          )}
        </div>

        {/* MODAL 1: PICK AN APP TO SHARE */}
        {isShareAppPickerOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Compartir una aplicación FOSS en el chat</h3>
                </div>
                <button onClick={() => setIsShareAppPickerOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Selecciona la aplicación de tu catálogo que deseas recomendar a tus amigos o al canal:
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2 p-1">
                {APPS_CATALOG.slice(0, 12).map((app: AppCatalogItem) => (
                  <div
                    key={app.id}
                    onClick={() => handleShareApp(app)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${app.iconBg} flex items-center justify-center text-white font-bold text-xs`}>
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{app.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{app.version} • {app.apkSizeMb} MB</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] transition">
                      Compartir
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD FRIEND */}
        {isAddFriendOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Agregar un Amigo o Contacto FOSS</h3>
                </div>
                <button onClick={() => setIsAddFriendOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFriendSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre o Alias</label>
                  <input
                    type="text"
                    placeholder="Ej. Martin Green"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Civer ID Soberano</label>
                  <input
                    type="text"
                    placeholder="Ej. martin.green@civer.id"
                    value={friendCiverId}
                    onChange={(e) => setFriendCiverId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    placeholder="martin@example.org"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-950"
                >
                  Confirmar y Añadir Amigo
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
