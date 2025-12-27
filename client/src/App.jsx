import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import { Layout } from './components/layout/Layout';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetail from './pages/equipment/EquipmentDetail';
import CreateEquipment from './pages/equipment/CreateEquipment';
import RequestKanban from './pages/requests/RequestKanban';
import CreateRequest from './pages/requests/CreateRequest';
import TeamsList from './pages/teams/TeamsList';
import Profile from './pages/profile/Profile';
import MaintenanceCalendar from './pages/maintenance-calendar/MaintenanceCalendar';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Technician, Manager, Admin can view Equipment/Requests */}
                  {/* Everyone (Technician included) can view Equipment */}
                  <Route element={<RoleRoute allowedRoles={['Admin', 'Manager', 'Technician']} />}>
                    <Route path="/equipment" element={<EquipmentList />} />
                    <Route path="/equipment/:id" element={<EquipmentDetail />} />
                    <Route path="/maintenance-calendar" element={<MaintenanceCalendar />} />
                    {/* Analytics for Manager & Technician */}
                    <Route element={<RoleRoute allowedRoles={['Manager', 'Technician']} />}>
                      <Route path="/analytics" element={<AnalyticsDashboard />} />
                    </Route>
                  </Route>

                  {/* Only Admin & Manager can view Requests and Create Equipment */}
                  <Route element={<RoleRoute allowedRoles={['Admin', 'Manager']} />}>
                    <Route path="/equipment/create" element={<CreateEquipment />} />
                    <Route path="/requests" element={<RequestKanban />} />
                    <Route path="/requests/create" element={<CreateRequest />} />
                  </Route>

                  {/* Only Managers and Admins can view Teams */}
                  <Route element={<RoleRoute allowedRoles={['Admin', 'Manager']} />}>
                    <Route path="/teams" element={<TeamsList />} />
                  </Route>

                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
