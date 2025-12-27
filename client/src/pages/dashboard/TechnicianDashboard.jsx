import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ClipboardList, CheckCircle } from 'lucide-react';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [myTasks, setMyTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // In a real API, we should have /api/requests?assignedTechnician=ME
                // For now, filtering client side from all requests
                const { data } = await axios.get('http://localhost:5000/api/requests');
                const tasks = data.filter(r => r.assignedTechnician?._id === user._id && r.status !== 'Repaired');
                setMyTasks(tasks);
            } catch (error) {
                console.error("Failed to fetch tasks");
            }
        };
        fetchTasks();
    }, [user._id]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Workbench</h1>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ClipboardList className="mr-2 h-5 w-5" />
                            Create Tasks ({myTasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {myTasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p>All caught up! No pending tasks.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myTasks.map(task => (
                                    <div key={task._id} className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-sm">
                                        <div>
                                            <h4 className="font-semibold">{task.subject}</h4>
                                            <p className="text-sm text-muted-foreground">Equipment: {task.equipment?.name}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge>{task.priority}</Badge>
                                            <Badge variant="outline">{task.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
