import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Ask_AI = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for sessions and chat
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(Date.now().toString());
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMode, setActiveMode] = useState('General');
    const [userData, setUserData] = useState({ name: 'User', initials: 'U' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [galleryImages, setGalleryImages] = useState([
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620712943543-bcc4628c6bb5?q=80&w=300&auto=format&fit=crop'
    ]);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const hasHandledQuery = useRef(false);

    const modes = {
        General: "You are a helpful assistant.",
        Images: "You are an AI image generation prompt engineer. Help the user create detailed prompts for image generation.",
        Apps: "You are a software architect. Analysis and design apps, features, and workflows.",
        Codex: "You are a world-class programmer. Provide only clean, efficient code with explanations.",
        GPTs: "You are a custom GPT assistant. Help the user find or create specialized AI agents.",
        Projects: "You are a project manager. Help organize tasks, timeline, and resources."
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Load user data
        const email = localStorage.getItem('user_email') || 'User';
        const namePart = email.split('@')[0];
        setUserData({
            name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
            initials: namePart.charAt(0).toUpperCase()
        });

        fetchConversations();

        // Handle URL query if present
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('q');
        if (query && !hasHandledQuery.current) {
            hasHandledQuery.current = true;
            handleSendMessage(null, query);
        }
    }, [navigate, location]);

    const fetchConversations = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const loadConversation = async (convId) => {
        const token = localStorage.getItem('access_token');
        setCurrentConversationId(convId);
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/history/${convId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages.length > 0 ? data.messages : [{ role: 'assistant', content: 'Conversation started.' }]);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = (mode = 'General') => {
        // If mode is an event (e.g. from onClick={handleNewChat}), default to 'General'
        const confirmedMode = typeof mode === 'string' ? mode : 'General';

        const newId = Date.now().toString();
        setCurrentConversationId(newId);
        setMessages([
            { role: 'assistant', content: `Hello! I'm ready to help you with ${confirmedMode === 'General' ? 'anything' : confirmedMode}. How can I assist you today?` }
        ]);
        setInput('');
        setSelectedFile(null);
        setActiveMode(confirmedMode);
    };

    const handleSendMessage = async (e, directQuery = null) => {
        if (e) e.preventDefault();
        const messageText = directQuery || input;

        if (!messageText.trim() || isLoading) return;

        const token = localStorage.getItem('access_token');
        const userMessage = { role: 'user', content: messageText };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        if (!directQuery) setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: messageText,
                    conversation_id: currentConversationId,
                    system_prompt: modes[activeMode] + " Use markdown for better formatting. Ensure sections are well-aligned."
                }),
            });

            if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown server error' }));
                throw new Error(errorData.detail || 'Failed to fetch response');
            }

            const data = await response.json();
            const aiMessage = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, aiMessage]);

            fetchConversations();
        } catch (error) {
            console.error('Chat Error:', error);
            if (error.message.includes('token') || error.message.includes('401')) {
                localStorage.clear();
                navigate('/login');
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** Connection failed. (${error.message})` }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAttachment = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedFile(data);

                // Add to gallery if it's an image
                if (file.type.startsWith('image/')) {
                    const imgUrl = `${import.meta.env.VITE_API_BASE}${data.url}`;
                    setGalleryImages(prev => [imgUrl, ...prev]);
                }

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `📎 **File attached:** ${file.name}. You can now ask questions about this file.`
                }]);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Failed to upload attachment');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden text-[15px]">
            <style>
                {`
                .sidebar-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.6rem 0.75rem; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; color: #4b5563; }
                .sidebar-item:hover { background-color: #f3f4f6; color: #111827; }
                .sidebar-item.active { background-color: #e2e8f0; color: #020617; }
                .sidebar-item svg { width: 1.1rem; height: 1.1rem; }
                .markdown-content p { margin-bottom: 0.75rem; line-height: 1.6; }
                .markdown-content pre { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; overflow-x: auto; margin: 1rem 0; }
                .markdown-content code { color: #eb5757; background: #fdf2f2; padding: 0.2rem 0.4rem; border-radius: 0.3rem; font-size: 0.9em; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                `}
            </style>

            {/* Sidebar */}
            <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
                <div className="p-3 space-y-1">
                    {/* Dashboard Navigation */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="sidebar-item hover:bg-slate-200/50 mb-3 border border-slate-200 bg-white shadow-sm font-bold text-indigo-600 transition-all hover:border-indigo-200"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Dashboard
                    </button>

                    <button
                        onClick={() => handleNewChat('General')}
                        className="sidebar-item hover:bg-slate-200/50 justify-between mb-4 border border-slate-200 shadow-sm bg-white"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            <span className="font-semibold text-slate-900">New chat</span>
                        </div>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>

                    <div className="relative group mb-3">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Search chats"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all shadow-sm"
                        />
                    </div>

                    <button
                        onClick={() => handleNewChat('Images')}
                        className={`sidebar-item ${activeMode === 'Images' ? 'active' : ''}`}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Images
                    </button>
                    <button
                        onClick={() => handleNewChat('Apps')}
                        className={`sidebar-item ${activeMode === 'Apps' ? 'active' : ''}`}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Apps
                    </button>
                    <button
                        onClick={() => handleNewChat('Codex')}
                        className={`sidebar-item ${activeMode === 'Codex' ? 'active' : ''}`}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        Codex
                    </button>
                    <button
                        onClick={() => handleNewChat('GPTs')}
                        className={`sidebar-item ${activeMode === 'GPTs' ? 'active' : ''}`}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.664 0l-.727-2.903a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-2.126 2.126a2 2 0 01-2.828-2.828l2.126-2.126a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-1.414-1.96L4.053 7.03a2 2 0 010-3.664l2.903-.727a2 2 0 001.414-1.96L8.847.293a2 2 0 012.828 0l2.126 2.126a2 2 0 001.022.547l2.387.477a2 2 0 001.96 1.414l.727 2.903a2 2 0 013.664 0l.727-2.903a2 2 0 001.96-1.414l2.387-.477a2 2 0 001.022-.547l2.126-2.126a2 2 0 012.828 2.828l-2.126 2.126z" /></svg>
                        GPTs
                    </button>
                    <button
                        onClick={() => handleNewChat('Projects')}
                        className={`sidebar-item ${activeMode === 'Projects' ? 'active' : ''}`}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg>
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveMode('History')}
                        className={`sidebar-item ${activeMode === 'History' ? 'active' : ''}`}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Detailed History
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-4 mt-4 scrollbar-hide">
                    {/* Chat History Section */}
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                            <span>History</span>
                            {searchQuery && <span className="text-[9px] bg-indigo-100 px-1.5 rounded text-indigo-600 font-bold uppercase animate-pulse">Search</span>}
                        </div>
                        <div className="space-y-1">
                            {filteredConversations.map((conv) => (
                                <button
                                    key={conv.conversation_id}
                                    onClick={() => loadConversation(conv.conversation_id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition truncate group flex items-center gap-2.5
                                        ${currentConversationId === conv.conversation_id
                                            ? 'bg-white text-slate-900 font-bold border border-slate-200 shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'}
                                    `}
                                >
                                    <svg className={`w-3.5 h-3.5 transition-opacity ${currentConversationId === conv.conversation_id ? 'opacity-100 text-indigo-500' : 'opacity-30 group-hover:opacity-60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    <span className="truncate">{conv.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Gallery Section */}
                    <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">My Gallery</div>
                        <div className="grid grid-cols-2 gap-2 px-2">
                            {galleryImages.slice(0, 4).map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition cursor-pointer group relative">
                                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setActiveMode('Images')}
                                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition bg-white/50"
                            >
                                View All
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-slate-200 bg-white">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm relative group transition-all hover:border-slate-300">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-indigo-100">
                            {userData.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{userData.name}</p>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tighter">Pro member</p>
                        </div>
                        <button
                            onClick={() => { localStorage.clear(); navigate('/login'); }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group/btn"
                            title="Sign out"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Chat Content */}
            <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-4 py-8">
                    <div className="max-w-3xl mx-auto w-full">
                        {activeMode === 'History' && (
                            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Conversation History
                                    </h2>
                                    <button className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">Clear All History</button>
                                </div>
                                <div className="space-y-3">
                                    {conversations.map((conv) => (
                                        <div key={conv.conversation_id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{conv.title}</h4>
                                                    <p className="text-xs text-slate-400">Last updated: {new Date(conv.last_updated).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { loadConversation(conv.conversation_id); setActiveMode('General'); }}
                                                className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                                            >
                                                Resume Chat
                                            </button>
                                        </div>
                                    ))}
                                    {conversations.length === 0 && (
                                        <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                                            <p className="text-slate-400 font-medium">Your conversation history will appear here.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="h-px bg-slate-100 w-full my-12" />
                            </div>
                        )}

                        {activeMode === 'Apps' && messages.length === 1 && (
                            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                        App Architect
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { title: "Design System", desc: "Create a consistent UI language" },
                                        { title: "API Blueprint", desc: "Design robust backend interfaces" },
                                        { title: "Database Schema", desc: "Plan efficient data structures" },
                                        { title: "User Workflow", desc: "Map out the customer journey" }
                                    ].map((app, i) => (
                                        <button key={i} onClick={() => setInput(app.title)} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition text-left group">
                                            <h4 className="font-bold text-slate-800 group-hover:text-emerald-600">{app.title}</h4>
                                            <p className="text-xs text-slate-500">{app.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="h-px bg-slate-100 w-full my-12" />
                            </div>
                        )}

                        {activeMode === 'Projects' && messages.length === 1 && (
                            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Project Hub
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {["Active Tasks", "Team Sync", "Roadmap"].map((proj, i) => (
                                        <button key={i} onClick={() => setInput(proj)} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg transition flex flex-col items-center justify-center gap-2 group">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <span className="font-bold text-sm text-slate-700">{proj}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="h-px bg-slate-100 w-full my-12" />
                            </div>
                        )}

                        {activeMode === 'GPTs' && messages.length === 1 && (
                            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        GPT Explorer
                                    </h2>
                                </div>
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 font-bold text-2xl">?</div>
                                    <div>
                                        <h4 className="font-bold text-orange-900">Discover AI Agents</h4>
                                        <p className="text-sm text-orange-700">Explore custom-built GPTs for specialized tasks like writing, coding, and data analysis.</p>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100 w-full my-12" />
                            </div>
                        )}

                        {activeMode === 'Images' && (
                            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Image Studio
                                    </h2>
                                    <span className="text-slate-400 text-sm font-medium">{galleryImages.length} items in collection</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition duration-300 group cursor-zoom-in relative">
                                            <img src={img} alt="Generated" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <a href={img} download target="_blank" rel="noopener noreferrer" className="bg-white text-black p-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition bg-slate-50 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 group-hover:shadow-md transition">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                        <span className="font-bold text-sm text-slate-600">Import Image</span>
                                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">PNG, JPG up to 10MB</span>
                                    </button>
                                </div>
                                <div className="h-px bg-slate-100 w-full my-12" />
                            </div>
                        )}

                        {messages.length === 1 && messages[0].role === 'assistant' && !['Images', 'Apps', 'Projects', 'GPTs'].includes(activeMode) && (
                            <div className="h-full flex flex-col items-center justify-center pt-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl mb-6">
                                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <h1 className="text-4xl font-bold text-slate-900 mb-2">What's on your mind?</h1>
                                <p className="text-slate-500 font-medium">Chat, build, or create with AI {activeMode !== 'General' && <span className="text-indigo-600 font-bold uppercase px-2 py-0.5 bg-indigo-50 rounded text-xs ml-2">{activeMode} Mode</span>}</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`flex gap-4 mb-10 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3.5`}>
                                    <div className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm transition-transform hover:scale-105
                                        ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}
                                    `}>
                                        {msg.role === 'user' ? 'U' : 'AI'}
                                    </div>
                                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed markdown-content transition-all
                                        ${msg.role === 'user'
                                            ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tr-none shadow-sm'
                                            : 'text-slate-800 bg-white border border-slate-100 shadow-sm rounded-tl-none ring-1 ring-slate-100'}
                                    `}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 mb-10 animate-pulse">
                                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200"></div>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Enhanced Input Area */}
                <footer className="p-6 bg-white border-t border-slate-100">
                    <div className="max-w-3xl mx-auto relative group">
                        <form
                            onSubmit={handleSendMessage}
                            className="bg-slate-100 rounded-[28px] p-2.5 flex items-center shadow-lg border border-slate-200/60 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:bg-white transition-all duration-300"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAttachment}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200 shadow-none hover:shadow-sm"
                                title="Attach file"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={activeMode === 'General' ? "Ask anything..." : `Message in ${activeMode} Mode...`}
                                className="flex-1 bg-transparent px-4 py-2 text-slate-800 outline-none placeholder:text-slate-400 font-medium text-[16px]"
                                disabled={isLoading}
                            />

                            <div className="flex items-center gap-1.5 pr-1">
                                <button type="button" className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-colors" title="Voice Search">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className={`p-2.5 rounded-full transition-all duration-300 transform ${input.trim() && !isLoading ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-100 hover:scale-110 active:scale-95' : 'text-slate-300 scale-95 opacity-50'}`}
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-3-3m3 3l3-3" /></svg>
                                </button>
                            </div>
                        </form>
                        <div className="flex justify-center gap-4 mt-3">
                            <p className="text-[11px] text-slate-400 font-medium">ChatGPT can make mistakes. Check important info.</p>
                            {activeMode !== 'General' && (
                                <button onClick={() => setActiveMode('General')} className="text-[11px] text-indigo-500 font-bold hover:underline">Reset to General Mode</button>
                            )}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Ask_AI;
