import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Wrench,
    Users,
    ClipboardList,
    Calendar,
    LogOut,
    Menu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Technician', 'User'] },
        { name: 'Equipment', path: '/equipment', icon: Wrench, roles: ['Admin', 'Manager', 'Technician'] },
        { name: 'Teams', path: '/teams', icon: Users, roles: ['Admin', 'Manager'] },
        { name: 'Requests', path: '/requests', icon: ClipboardList, roles: ['Admin', 'Manager', 'Technician'] },
        { name: 'Maintenance', path: '/maintenance-calendar', icon: Calendar, roles: ['Admin', 'Manager', 'Technician'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b">
                    <Wrench className="h-6 w-6 text-primary mr-2" />
                    <span className="text-xl font-bold">GearGuard</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <Link to="/profile" className="flex items-center space-x-3 mb-4 px-2 hover:bg-accent rounded-md p-2 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                            {user?.avatar && !user.avatar.includes('default') ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span>{user?.name?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                        </div>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 bg-card border-b flex md:hidden items-center px-4 justify-between">
                    <div className="flex items-center">
                        <Wrench className="h-6 w-6 text-primary mr-2" />
                        <span className="text-xl font-bold">GearGuard</span>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
