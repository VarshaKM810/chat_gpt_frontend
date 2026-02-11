import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in by looking for the token
        const token = localStorage.getItem('access_token');

        if (!token) {
            // If no token, redirect to login
            navigate('/login');
        } else {
            // In a real application, you would fetch the user's actual profile from the backend here.
            // For this demo, we'll simulate a successful profile fetch.
            setTimeout(() => {
                setUser({
                    name: 'Premium User',
                    email: 'user@example.com',
                    plan: 'Pro Plan',
                    avatar: 'P'
                });
                setLoading(false);
            }, 500);
        }
    }, [navigate]);

    const handleLogout = () => {
        // Clear all stored data
        localStorage.clear();
        // Redirect to login page
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Desktop Only */}
            <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">
                            A
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">AI GPT</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <button className="w-full flex items-center space-x-3 bg-indigo-600 text-white px-4 py-3 rounded-xl transition shadow-lg shadow-indigo-500/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition group">
                        <svg className="w-5 h-5 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="font-medium">Chat History</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition group">
                        <svg className="w-5 h-5 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium">Profile</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-xl transition font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-800 lg:hidden">AI GPT</h2>
                    <div className="flex-1 lg:flex-none"></div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                            <p className="text-xs font-medium text-slate-500">{user?.plan}</p>
                        </div>
                        <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                            {user?.avatar}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-8 max-w-7xl mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900">Welcome Back!</h1>
                        <p className="text-slate-500 mt-1">Here's what's happening with your AI projects today.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Stat Item 1 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                </div>
                                <span className="text-green-500 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">+2.1%</span>
                            </div>
                            <p className="text-slate-500 font-medium mt-4 text-sm">Total Conversations</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">14,208</h3>
                        </div>

                        {/* Stat Item 2 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <span className="text-indigo-500 text-sm font-bold bg-indigo-50 px-2 py-1 rounded-lg">Active</span>
                            </div>
                            <p className="text-slate-500 font-medium mt-4 text-sm">Token Consumption</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">84.5k/100k</h3>
                        </div>

                        {/* Stat Item 3 */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <span className="text-slate-400 text-sm font-medium">This Month</span>
                            </div>
                            <p className="text-slate-500 font-medium mt-4 text-sm">Average Response Time</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">1.2s</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900">Recent Chats</h3>
                                    <button className="text-indigo-600 font-bold text-sm hover:text-indigo-700 transition">Create New +</button>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {[
                                        { title: 'Python Scraper Debugging', time: '10m ago', tags: ['Python', 'Code'] },
                                        { title: 'Landing Page Copywriting', time: '2h ago', tags: ['Marketing', 'Copy'] },
                                        { title: 'Travel Itinerary: Japan', time: 'Yesterday', tags: ['Travel'] },
                                    ].map((chat, idx) => (
                                        <div key={idx} className="p-6 hover:bg-slate-50/50 transition cursor-pointer flex items-center justify-between group">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-500 transition shadow-sm">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition tracking-tight">{chat.title}</h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-xs text-slate-400 font-medium">{chat.time}</span>
                                                        <span className="text-slate-200">|</span>
                                                        {chat.tags.map(tag => (
                                                            <span key={tag} className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-300 transform group-hover:translate-x-1 transition" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Action Section */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200">
                                <h3 className="text-lg font-black leading-tight">Upgrade to ChatGPT Plus</h3>
                                <p className="text-indigo-100 text-sm mt-2 font-medium opacity-90 italic">Get access to GPT-4, DALL-E 3, and faster response times.</p>
                                <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl mt-6 hover:bg-slate-50 transition shadow-lg">Upgrade Now</button>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Session Info</h3>
                                <div className="mt-4 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Access Token</span>
                                        <span className="text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded text-[10px] uppercase">Active</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Logged in as</span>
                                        <span className="text-slate-800 font-bold">{user?.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;