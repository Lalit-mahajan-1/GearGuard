import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
    }

    // Redirect to login if user is not authenticated
    // Note: In real app, you might want to check token validity with backend first
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
