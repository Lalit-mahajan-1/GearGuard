import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ClipboardList } from 'lucide-react';
import KanbanBoard from '../../components/kanban/KanbanBoard';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/requests');
                setRequests(data.filter(r => r.assignedTechnician?._id === user._id));
            } catch (error) {
                console.error('Failed to fetch requests');
            }
        };
        fetchRequests();
    }, [user._id]);

    const refresh = async () => {
        const { data } = await axios.get('http://localhost:5000/api/requests');
        setRequests(data.filter(r => r.assignedTechnician?._id === user._id));
    };

    const handleMove = async (id, toStatus) => {
        // optimistic
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status: toStatus } : r));
        try {
            await axios.put(`http://localhost:5000/api/requests/${id}`, { status: toStatus });
        } catch (e) {
            await refresh();
        }
    };

    const handleDuration = async (req, hours) => {
        try {
            await axios.put(`http://localhost:5000/api/requests/${req._id}`, { duration: hours });
            await refresh();
        } catch (e) {
            console.error('Failed to update duration');
        }
    };

    const handleAddNote = async (req, text) => {
        try {
            await axios.post(`http://localhost:5000/api/requests/${req._id}/notes`, { text });
            await refresh();
        } catch (e) {
            console.error('Failed to add note');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Workbench</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ClipboardList className="mr-2 h-5 w-5" /> Assigned Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <KanbanBoard
                        role="Technician"
                        items={requests}
                        columns={['New','In Progress','Repaired']}
                        onMove={handleMove}
                        onUpdateDuration={handleDuration}
                        onAddNote={handleAddNote}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default TechnicianDashboard;
