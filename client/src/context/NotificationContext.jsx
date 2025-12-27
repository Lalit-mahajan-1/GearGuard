import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await axios.get('http://localhost:5000/api/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await axios.put('http://localhost:5000/api/notifications/read');
            // update locally
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refresh: fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
