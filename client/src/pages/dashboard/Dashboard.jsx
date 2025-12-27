import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import TechnicianDashboard from './TechnicianDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'Admin') return <AdminDashboard />;
    if (user?.role === 'Manager') return <ManagerDashboard />;
    if (user?.role === 'Technician') return <TechnicianDashboard />;

    // Default User Dashboard (or fallback)
    return <div className="p-8">Welcome, {user?.name}. You have limited access.</div>;
};

export default Dashboard;
