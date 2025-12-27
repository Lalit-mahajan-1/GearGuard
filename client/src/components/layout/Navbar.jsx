import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import ProfileHoverCard from '../ui/ProfileHoverCard';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleNotifications = () => {
        if (!showNotifications) {
            // Opening
            setShowNotifications(true);
            markAsRead(); // Mark as read when opened
        } else {
            setShowNotifications(false);
        }
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                {/* Optional: Brand logic if needed, but sidebar has brand usually */}
                <div className="md:hidden font-bold text-xl flex items-center gap-2">
                    <span className="text-primary">GearGuard</span>
                </div>
            </div>

            <div className="flex items-center gap-4">

                {/* Notification Bell */}
                <div className="relative">
                    <Button variant="ghost" size="icon" className="relative" onClick={toggleNotifications}>
                        <Bell className="h-5 w-5 text-slate-600" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </Button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-100 z-50 overflow-hidden text-sm">
                                <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                                    <span className="font-semibold text-slate-700">Notifications</span>
                                    <span className="text-xs text-slate-500">{notifications.length} recent</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">No new notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n._id} className={cn("px-4 py-3 border-b last:border-0 hover:bg-slate-50 transition-colors", !n.read && "bg-blue-50/50")}>
                                                <p className="text-slate-800 font-medium mb-1 line-clamp-2">{n.message}</p>
                                                <div className="flex justify-between items-center text-xs text-slate-500">
                                                    <span>{n.type}</span>
                                                    <span>{format(new Date(n.createdAt), 'MMM d, h:mm a')}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile Hover Card */}
                <div className="pl-4 border-l">
                    <ProfileHoverCard showName className="items-center" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
