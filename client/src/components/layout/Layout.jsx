import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Wrench,
    Users,
    ClipboardList,
    Calendar,
    BarChart3,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [teamMembers, setTeamMembers] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Technician', 'User'] },
        { name: 'Equipment', path: '/equipment', icon: Wrench, roles: ['Admin', 'Manager', 'Technician'] },
        { name: 'Teams', path: '/teams', icon: Users, roles: ['Admin', 'Manager'] },
        { name: 'Requests', path: '/requests', icon: ClipboardList, roles: ['Admin', 'Manager', 'Technician'] },
        { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['Manager', 'Technician'] },
        { name: 'Maintenance', path: '/maintenance-calendar', icon: Calendar, roles: ['Admin', 'Manager', 'Technician'] },
    ];

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles.includes(user?.role)) return false;
        if (item.name === 'Requests' && !['Admin', 'Manager'].includes(user?.role)) return false;
        if (item.name === 'Analytics' && !['Manager', 'Technician'].includes(user?.role)) return false;
        if (item.name === 'Teams' && !['Admin', 'Manager'].includes(user?.role)) return false;
        return true;
    });

    useEffect(() => {
        const shouldShowTeam = user?.role === 'Technician' && location.pathname.startsWith('/dashboard');
        if (!shouldShowTeam) {
            setTeamMembers([]);
            return;
        }
        const fetchMembers = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/teams/mine/members');
                setTeamMembers(data);
            } catch (e) {
                setTeamMembers([]);
            }
        };
        fetchMembers();
    }, [user?.role, location.pathname]);

    // Close sidebar on route change on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Wrench className="h-6 w-6" />
                        <span className="text-xl font-bold text-white">GearGuard</span>
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* Technician Team Section */}
                    {user?.role === 'Technician' && location.pathname.startsWith('/dashboard') && teamMembers.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 px-2">My Team</div>
                            <div className="space-y-2">
                                {teamMembers.map(m => {
                                    const isMe = m._id === user?._id;
                                    return (
                                        <div key={m._id} className={cn(
                                            'flex items-center gap-3 rounded-md px-2 py-1.5',
                                            isMe ? 'bg-slate-800/50 text-blue-300' : 'text-slate-400'
                                        )}>
                                            <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-600">
                                                {(m.name || '?').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm truncate">{m.name}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar onToggleSidebar={() => setSidebarOpen(true)} isSidebarOpen={sidebarOpen} />
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 relative">
                    {children}
                </div>
            </main>
        </div>
    );
};
