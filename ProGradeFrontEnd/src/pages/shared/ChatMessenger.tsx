import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../features/chat/chatService';
import EmojiPicker from 'emoji-picker-react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // 🌟 Added useNavigate
import { Search, Paperclip, Smile, MoreVertical, Check, CheckCheck, ShieldAlert, XCircle, Ban, Flag, ChevronLeft, SendHorizonal, EyeOff, Eye, File as FileIcon, Image as ImageIcon, Download } from 'lucide-react';

export default function ChatMessenger() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate(); // 🌟 Initialized navigate

    // Core State
    const [rooms, setRooms] = useState<any[]>([]);
    const [activeRoom, setActiveRoom] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);

    // UI & Form States
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<any | null>(null);
    const [searchError, setSearchError] = useState('');
    const [inputMsg, setInputMsg] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [isViewOnce, setIsViewOnce] = useState(false); 
    const [selectedFile, setSelectedFile] = useState<File | null>(null); 
    const [isTyping, setIsTyping] = useState(false);
    const [opponentTyping, setOpponentTyping] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

    // Refs
    const activeRoomRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const suggestions = ["Acknowledged.", "Please review the attachment.", "Let's discuss this.", "Approved."];

    const getOpponentEmail = (room: any) => room.initiatorEmail === user?.email ? room.recipientEmail : room.initiatorEmail;

    const loadOpponentDetails = async (room: any) => {
        const oppEmail = getOpponentEmail(room);
        try {
            const oppDetails = await chatService.searchUser(oppEmail);
            return { ...room, opponentDetails: oppDetails };
        } catch (e) {
            return { ...room, opponentDetails: { name: oppEmail.split('@')[0], email: oppEmail, isOnline: false } };
        }
    };

    useEffect(() => {
        chatService.getRooms().then(async (data) => {
            setRooms(data);
            const roomIdParam = searchParams.get('room');
            if (roomIdParam) {
                const roomToOpen = data.find((r: any) => String(r.id) === String(roomIdParam));
                if (roomToOpen) {
                    const enrichedRoom = await loadOpponentDetails(roomToOpen);
                    setActiveRoom(enrichedRoom);
                    const msgs = await chatService.getMessages(roomToOpen.id);
                    setMessages(msgs);
                }
            }
        }).catch(console.error);
    }, []);

    useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, opponentTyping]);

    useEffect(() => {
        if (!activeRoom || activeRoom.isNew) return;
        const interval = setInterval(async () => {
            const enriched = await loadOpponentDetails(activeRoomRef.current);
            setActiveRoom(enriched);
        }, 10000); 
        return () => clearInterval(interval);
    }, [activeRoom?.id]);

    useEffect(() => {
        const handleChatEvent = (e: any) => {
            const { type, payload } = e.detail;
            const currentRoom = activeRoomRef.current;

            if (type === 'CHAT_MESSAGE') {
                if (currentRoom && String(payload.roomId) === String(currentRoom.id)) {
                    setMessages(prev => [...prev, payload]);
                    chatService.markSeen(payload.roomId).then(() => {
                        setMessages(prev => prev.map(m => {
                            if (m.id === payload.id && m.isViewOnce) return { ...m, content: "💣 [View-Once Message Opened]", fileUrl: null, status: 'SEEN' };
                            if (m.id === payload.id) return { ...m, status: 'SEEN' };
                            return m;
                        }));
                    });
                }
                chatService.getRooms().then(setRooms);
            }
            if (type === 'TYPING' && currentRoom && String(payload.roomId) === String(currentRoom.id)) {
                if (payload.email.toLowerCase() !== user?.email.toLowerCase()) setOpponentTyping(payload.isTyping);
            }
            if (type === 'MESSAGES_SEEN' && currentRoom && String(payload.roomId) === String(currentRoom.id)) {
                setMessages(prev => prev.map(m => {
                    if (m.senderEmail === user?.email && m.status !== 'SEEN') {
                        if (m.isViewOnce) return { ...m, status: 'SEEN', seenAt: payload.seenAt, content: "💣 [View-Once Message Opened]", fileUrl: null };
                        return { ...m, status: 'SEEN', seenAt: payload.seenAt };
                    }
                    return m;
                }));
            }
            if (type === 'ROOM_UPDATE') {
                if (currentRoom && String(payload.id) === String(currentRoom.id)) {
                    setActiveRoom((prev: any) => ({ ...prev, status: payload.status, blockedByEmail: payload.blockedByEmail }));
                }
                chatService.getRooms().then(setRooms);
            }
        };

        document.addEventListener('onChatEngineEvent', handleChatEvent);
        return () => document.removeEventListener('onChatEngineEvent', handleChatEvent);
    }, [user?.email]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchError(''); setSearchResult(null);
        if (!searchEmail.trim()) return;
        if (searchEmail.toLowerCase() === user?.email.toLowerCase()) return setSearchError("You cannot search for yourself.");

        try {
            const res = await chatService.searchUser(searchEmail);
            setSearchResult(res);
        } catch (err: any) { setSearchError("User does not exist in our system."); }
    };

    const openNewChat = async (targetUser: any) => {
        const existing = rooms.find(r => r.initiatorEmail === targetUser.email || r.recipientEmail === targetUser.email);
        if (existing) {
            const enriched = await loadOpponentDetails(existing);
            setActiveRoom(enriched);
            setSearchParams({ room: existing.id.toString() });
            const msgs = await chatService.getMessages(existing.id);
            setMessages(msgs);
        } else {
            setActiveRoom({ id: 'NEW', initiatorEmail: user?.email, recipientEmail: targetUser.email, status: 'PENDING', isNew: true, opponentDetails: targetUser });
            setSearchParams({});
            setMessages([]);
        }
        setSearchEmail(''); setSearchResult(null);
    };

    const handleRoomClick = async (room: any) => {
        setSearchParams({ room: room.id.toString() });
        const enriched = await loadOpponentDetails(room);
        setActiveRoom(enriched);
        const msgs = await chatService.getMessages(room.id);
        setMessages(msgs);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleSend = async (text: string = inputMsg) => {
        if ((!text.trim() && !selectedFile) || !activeRoom) return;
        const targetEmail = activeRoom.initiatorEmail === user?.email ? activeRoom.recipientEmail : activeRoom.initiatorEmail;

        let fileUrl = undefined;
        let fileName = undefined;
        if (selectedFile) {
            fileUrl = URL.createObjectURL(selectedFile); 
            fileName = selectedFile.name;
        }

        const tempId = Date.now();
        const tempMsg = { id: tempId, senderEmail: user?.email, content: text, fileUrl, fileName, isViewOnce, status: 'SENT', timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        setInputMsg(''); setShowEmoji(false); setSelectedFile(null); setIsViewOnce(false);

        try {
            const realMsg = await chatService.sendMessage(targetEmail, text, fileUrl, fileName, isViewOnce);
            setMessages(prev => prev.map(m => {
                if (m.id === tempId) return { ...realMsg, status: m.status === 'SEEN' ? 'SEEN' : realMsg.status };
                return m;
            }));

            if (activeRoom.isNew) {
                const updatedRooms = await chatService.getRooms();
                setRooms(updatedRooms);
                const newRoom = updatedRooms.find((r: any) => r.initiatorEmail === targetEmail || r.recipientEmail === targetEmail);
                if (newRoom) {
                    const enriched = await loadOpponentDetails(newRoom);
                    setActiveRoom(enriched);
                    setSearchParams({ room: newRoom.id.toString() });
                }
            }
        } catch (e: any) {
            alert("Message failed to send. " + e.message);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMsg(e.target.value);
        if (!activeRoom || activeRoom.isNew) return;

        if (!isTyping) {
            setIsTyping(true);
            chatService.sendTyping(activeRoom.id, true);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            chatService.sendTyping(activeRoom.id, false);
        }, 1500);
    };

    const handleRoomAction = async (action: 'ACCEPT' | 'BLOCK' | 'UNBLOCK') => {
        const updated = await chatService.updateRoomStatus(activeRoom.id, action);
        setActiveRoom((prev: any) => ({ ...updated, opponentDetails: prev?.opponentDetails }));
        chatService.getRooms().then(setRooms);
        setShowMenu(false);
    };

    const closeChatMobile = () => { setActiveRoom(null); setSearchParams({}); };

    // 🌟 HELPER: Generate Redirect path for Reports
    const handleReportRedirect = () => {
        setShowMenu(false);
        const opponentEmail = encodeURIComponent(getOpponentEmail(activeRoom));
        const rolePath = user?.role === 'EDUCATOR' ? 'educator' : 'student';
        navigate(`/${rolePath}/reports?type=CHAT_ABUSE&target=${opponentEmail}`);
    };

    return (
        <div className="w-full min-w-0 h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-xl border-2 border-gray-200 dark:border-purple-900/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex relative animate-in fade-in">

            <div className={`w-full md:w-80 border-r-2 border-gray-200 dark:border-purple-900/50 flex flex-col bg-white/40 dark:bg-[#0f0a1c]/40 shrink-0 z-20 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b-2 border-gray-200 dark:border-purple-900/50">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Messages</h2>
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="email" placeholder="Search by email..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a0d36] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner dark:text-white transition-all cursor-text"
                        />
                    </form>
                    {searchError && <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-wider">{searchError}</p>}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {searchResult && (
                        <div onClick={() => openNewChat(searchResult)} className="m-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 cursor-pointer hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black shadow-sm group-hover:scale-105 transition-transform">{searchResult.name.charAt(0)}</div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#150a29] ${searchResult.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-400'}`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight truncate">{searchResult.name}</h4>
                                    <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 truncate">{searchResult.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!searchResult && rooms.map(room => {
                        const oppEmail = getOpponentEmail(room);
                        const oppName = room.opponentDetails?.name || oppEmail.split('@')[0];
                        const isActive = activeRoom?.id === room.id;
                        return (
                            <div key={room.id} onClick={() => handleRoomClick(room)} className={`p-4 mx-2 my-1 rounded-2xl cursor-pointer transition-all border-2 group ${isActive ? 'bg-white dark:bg-[#1a0d36] border-purple-200 dark:border-purple-500/50 shadow-md transform scale-[1.02]' : 'border-transparent hover:bg-gray-50 dark:hover:bg-[#1a0d36]/50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300 font-black shrink-0 group-hover:scale-105 transition-transform shadow-inner">{oppName.charAt(0).toUpperCase()}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">{oppName}</h4>
                                            {room.status === 'PENDING' && <span className="text-[9px] bg-orange-100 text-orange-600 dark:bg-orange-900/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0">Request</span>}
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium truncate">{room.status === 'BLOCKED' ? '🚫 Blocked' : 'Click to view chat'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={`flex-1 w-full min-w-0 flex flex-col h-full relative bg-gray-50 dark:bg-[#05020a] ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>

                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 60 0 51.96V17.32L30 0zm0 34.64l20-11.55-20-11.55-20 11.55 20 11.55zM10 23.09v23.09l20 11.55v-23.1L10 23.09zm40 0l-20 11.55v23.1l20-11.55v-23.09z' fill='%236b21a8' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '40px' }}>
                </div>
                <div className="absolute w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] -top-64 -left-64 pointer-events-none"></div>

                {activeRoom ? (
                    <>
                        <div className="h-20 border-b-2 border-gray-200 dark:border-purple-900/50 flex items-center justify-between px-3 sm:px-6 bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl z-[100] shrink-0 shadow-sm relative">

                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 pr-2">
                                <button title="Back to Chats" onClick={closeChatMobile} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors shrink-0"><ChevronLeft className="w-6 h-6"/></button>

                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black shadow-lg text-lg ring-2 ring-white dark:ring-[#150a29]">
                                        {activeRoom.opponentDetails?.name?.charAt(0) || "U"}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight drop-shadow-sm truncate">
                                        {activeRoom.opponentDetails?.name || 'User'}
                                    </h3>
                                    <p className="hidden sm:block text-[10px] text-gray-500 font-mono mb-0.5 truncate">{getOpponentEmail(activeRoom)}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 truncate">
                                        {opponentTyping ? (
                                            <span className="text-emerald-500 animate-pulse font-extrabold drop-shadow-md">Typing...</span>
                                        ) : activeRoom.opponentDetails?.isOnline ? (
                                            <span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">● Online</span>
                                        ) : (
                                            <span className="text-gray-400">○ Offline</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="relative shrink-0">
                                <button title="More Options" onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors cursor-pointer">
                                    <MoreVertical className="w-5 h-5"/>
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#150a29] border-2 border-gray-100 dark:border-purple-900/50 rounded-2xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {activeRoom.status !== 'BLOCKED' ? (
                                            <button onClick={() => handleRoomAction('BLOCK')} className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer transition-colors"><Ban className="w-4 h-4"/> Block User</button>
                                        ) : (
                                            activeRoom.blockedByEmail === user?.email && <button onClick={() => handleRoomAction('UNBLOCK')} className="w-full px-4 py-3 text-left text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2 cursor-pointer transition-colors"><CheckCircle2 className="w-4 h-4"/> Unblock User</button>
                                        )}
                                        
                                        {/* 🌟 HIDE REPORT OPTION IF USER IS AN ADMIN */}
                                        {user?.role !== 'ADMIN' && (
                                            <button onClick={handleReportRedirect} className="w-full px-4 py-3 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2 cursor-pointer transition-colors border-t border-gray-100 dark:border-gray-800">
                                                <Flag className="w-4 h-4"/> Report Content
                                            </button>
                                        )}
                                        
                                        <button onClick={closeChatMobile} className="w-full px-4 py-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer transition-colors border-t border-gray-100 dark:border-gray-800"><XCircle className="w-4 h-4"/> Close Chat</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 custom-scrollbar relative z-10 w-full" onClick={() => {setShowEmoji(false); setShowMenu(false); setActiveTooltip(null);}}>

                            {!activeRoom.isNew && activeRoom.status !== 'ACCEPTED' && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-20">
                                    {activeRoom.status === 'PENDING' && activeRoom.recipientEmail === user?.email && (
                                        <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-2 border-purple-200 dark:border-purple-500 text-center">
                                            <ShieldAlert className="w-6 h-6 text-purple-500 mx-auto mb-2"/>
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white">Message Request</h4>
                                            <p className="text-[10px] text-gray-500 font-semibold mb-3">Accept to reply and allow read receipts.</p>
                                            <div className="flex gap-2 justify-center">
                                                <button title="Block Request" onClick={() => handleRoomAction('BLOCK')} className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg text-xs font-black uppercase cursor-pointer transition-colors">Block</button>
                                                <button title="Accept Request" onClick={() => handleRoomAction('ACCEPT')} className="px-4 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-xs font-black uppercase cursor-pointer transition-colors shadow-md">Accept</button>
                                            </div>
                                        </div>
                                    )}
                                    {activeRoom.status === 'BLOCKED' && (
                                        <div className="bg-red-50/90 dark:bg-red-900/30 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 text-center">
                                            <Ban className="w-6 h-6 text-red-500 mx-auto mb-2"/>
                                            <h4 className="text-sm font-black text-red-700 dark:text-red-400">Communication Blocked</h4>
                                            {activeRoom.blockedByEmail === user?.email ? (
                                                <button onClick={() => handleRoomAction('UNBLOCK')} className="mt-2 px-4 py-1.5 bg-white dark:bg-[#1a0d36] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-black cursor-pointer transition-colors shadow-sm">Unblock User</button>
                                            ) : (
                                                <p className="text-[10px] text-red-500 font-bold mt-1">You have been blocked by this user.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                const isMe = msg.senderEmail === user?.email;
                                return (
                                    <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                        <div className={`max-w-[85%] sm:max-w-[70%] min-w-0 rounded-2xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative group ${isMe ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-none border border-purple-500/50' : 'bg-white/95 dark:bg-[#1a0d36]/95 backdrop-blur-md text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-purple-900/50'}`}>

                                            {msg.fileUrl && (
                                                <a href={msg.fileUrl} download={msg.fileName || "attachment"} target="_blank" rel="noreferrer" title="Download File" className="mb-2 p-2 rounded-xl bg-black/10 dark:bg-black/30 flex items-center gap-3 border border-white/10 cursor-pointer hover:bg-black/20 dark:hover:bg-black/40 transition-colors w-full">
                                                    {msg.fileName?.match(/\.(jpeg|jpg|gif|png)$/i) ? <ImageIcon className="w-8 h-8 opacity-80 shrink-0"/> : <FileIcon className="w-8 h-8 opacity-80 shrink-0"/>}
                                                    <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{msg.fileName}</p></div>
                                                    <Download className="w-4 h-4 opacity-50 hover:opacity-100 shrink-0" />
                                                </a>
                                            )}

                                            <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${msg.isViewOnce && msg.status === 'SEEN' && !isMe ? 'italic opacity-60' : ''}`}>
                                                {msg.isViewOnce && !isMe && msg.status !== 'SEEN' ? '🔒 View Once Message (Disappears after reading)' : msg.content}
                                            </p>

                                            <div className={`flex items-center justify-end gap-1 mt-1.5 text-[9px] font-bold ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                                {msg.isViewOnce && <EyeOff className="w-3 h-3 mr-1 opacity-70" title="View Once Message"/>}
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                                                {isMe && (
                                                    <div 
                                                        className="ml-1 relative flex items-center lg:group/tick cursor-pointer"
                                                        onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === msg.id ? null : msg.id); }}
                                                    >
                                                        {msg.status === 'SENT' && <Check className="w-3.5 h-3.5 opacity-70"/>}
                                                        {msg.status === 'DELIVERED' && <CheckCheck className="w-3.5 h-3.5 opacity-70"/>}
                                                        {msg.status === 'SEEN' && <CheckCheck className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]"/>}

                                                        <div className={`absolute right-full mr-2 top-1/2 -translate-y-1/2 ${activeTooltip === msg.id ? 'block' : 'hidden lg:group-hover/tick:block'} bg-gray-900/95 backdrop-blur-sm text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl border border-gray-700 z-[100] animate-in fade-in`}>
                                                            <div className="font-black text-gray-400 mb-0.5">MESSAGE INFO</div>
                                                            Delivered: {msg.deliveredAt ? new Date(msg.deliveredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}<br/>
                                                            Seen: {msg.seenAt ? new Date(msg.seenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 sm:p-4 bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-t-2 border-gray-200 dark:border-purple-900/50 shrink-0 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] w-full">

                            <div className="flex gap-2 overflow-x-auto custom-scrollbar mb-2 sm:mb-3 pb-1 w-full">
                                {suggestions.map((text, i) => (
                                    <button key={i} title={`Quick reply: "${text}"`} onClick={() => handleSend(text)} disabled={activeRoom.status === 'BLOCKED'} className="shrink-0 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full text-[10px] font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-600 hover:text-white cursor-pointer transition-colors disabled:opacity-50 shadow-sm">
                                        {text}
                                    </button>
                                ))}
                            </div>

                            {selectedFile && (
                                <div className="absolute bottom-full left-4 mb-2 bg-white dark:bg-[#1a0d36] p-3 rounded-xl shadow-2xl border-2 border-purple-200 flex items-center gap-3 animate-in slide-in-from-bottom-2 z-50 max-w-[80%]">
                                    <FileIcon className="w-6 h-6 text-purple-500 shrink-0"/>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 min-w-0 truncate">{selectedFile.name}</span>
                                    <button title="Remove Attachment" onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-50 text-red-500 rounded-md cursor-pointer shrink-0"><XCircle className="w-4 h-4"/></button>
                                </div>
                            )}

                            {showEmoji && (
                                <div className="absolute bottom-[80px] left-4 shadow-2xl z-50 animate-in zoom-in-95">
                                    <EmojiPicker width={280} height={350} theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'} onEmojiClick={(e) => setInputMsg(prev => prev + e.emoji)} />
                                </div>
                            )}

                            <div className="flex items-end gap-2 sm:gap-3 relative w-full">
                                <button title="Add Emoji" onClick={() => setShowEmoji(!showEmoji)} disabled={activeRoom.status === 'BLOCKED'} className="p-2.5 sm:p-3 text-gray-400 hover:text-amber-500 bg-white dark:bg-[#1a0d36] shadow-sm rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50 border border-gray-200 dark:border-gray-800"><Smile className="w-5 h-5"/></button>

                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                <button title="Attach File" onClick={() => fileInputRef.current?.click()} disabled={activeRoom.status === 'BLOCKED'} className="p-2.5 sm:p-3 text-gray-400 hover:text-blue-500 bg-white dark:bg-[#1a0d36] shadow-sm rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50 border border-gray-200 dark:border-gray-800"><Paperclip className="w-5 h-5"/></button>

                                <button title={isViewOnce ? "View Once Enabled" : "Send as View Once"} onClick={() => setIsViewOnce(!isViewOnce)} disabled={activeRoom.status === 'BLOCKED'} className={`p-2.5 sm:p-3 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm border ${isViewOnce ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800' : 'bg-white dark:bg-[#1a0d36] text-gray-400 border-gray-200 dark:border-gray-800 hover:text-purple-500'}`}>
                                    {isViewOnce ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>

                                <input 
                                    type="text" placeholder={activeRoom.status === 'BLOCKED' ? "Chat is blocked" : "Type a secure message..."}
                                    value={inputMsg} onChange={handleTyping} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={activeRoom.status === 'BLOCKED'}
                                    className="flex-1 min-w-0 w-full bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-purple-500 shadow-inner dark:text-white disabled:opacity-50 transition-all cursor-text"
                                />

                                <button title="Send Message" onClick={() => handleSend()} disabled={(!inputMsg.trim() && !selectedFile) || activeRoom.status === 'BLOCKED'} className="p-2.5 sm:p-3 bg-gradient-to-b from-purple-500 to-purple-700 text-white rounded-xl shadow-[0_4px_0_rgb(107,33,168)] hover:from-purple-400 hover:to-purple-600 disabled:opacity-50 disabled:shadow-none disabled:translate-y-[4px] disabled:bg-gray-400 transition-all active:shadow-[0_0px_0_rgb(107,33,168)] active:translate-y-[4px] cursor-pointer shrink-0 border border-purple-800">
                                    <SendHorizonal className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10 hidden md:flex w-full">
                        <div className="w-32 h-32 bg-white/50 dark:bg-purple-900/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/50 dark:border-[#150a29]">
                            <Search className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 mb-2 drop-shadow-sm">Enterprise Collaboration</h2>
                        <p className="text-gray-600 dark:text-gray-400 font-bold max-w-sm leading-relaxed">Secure, encrypted, end-to-end messaging with your team and educators.</p>
                    </div>
                )}
            </div>
        </div>
    );
}