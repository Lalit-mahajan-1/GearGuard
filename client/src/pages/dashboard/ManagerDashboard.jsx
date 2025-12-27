import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Wrench, AlertTriangle, Users } from 'lucide-react';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        openRequests: 0,
        overdueRequests: 0,
        activeTeams: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [eqRes, reqRes, teamRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/equipment'),
                    axios.get('http://localhost:5000/api/requests'),
                    axios.get('http://localhost:5000/api/teams')
                ]);

                const now = new Date();
                const overdue = reqRes.data.filter(r =>
                    r.status !== 'Repaired' &&
                    r.status !== 'Scrapped' &&
                    r.scheduledDate &&
                    new Date(r.scheduledDate) < now
                ).length;

                const open = reqRes.data.filter(r =>
                    ['New', 'In Progress'].includes(r.status)
                ).length;

                setStats({
                    totalEquipment: eqRes.data.length,
                    openRequests: open,
                    overdueRequests: overdue,
                    activeTeams: teamRes.data.length
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: "Total Equipment", value: stats.totalEquipment, icon: Wrench, color: "text-blue-600" },
        { title: "Open Requests", value: stats.openRequests, icon: AlertTriangle, color: "text-yellow-600" },
        { title: "Overdue Tasks", value: stats.overdueRequests, icon: AlertTriangle, color: "text-red-600" },
        { title: "Active Teams", value: stats.activeTeams, icon: Users, color: "text-green-600" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manager Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            {/* Add more Manager specific widgets here like "Team Performance" */}
        </div>
    );
};

export default ManagerDashboard;
