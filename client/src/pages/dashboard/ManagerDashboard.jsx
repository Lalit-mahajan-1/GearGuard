import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Wrench, AlertTriangle, Users, Filter } from 'lucide-react';
import KanbanBoard from '../../components/kanban/KanbanBoard';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        openRequests: 0,
        overdueRequests: 0,
        activeTeams: 0
    });

    const [requests, setRequests] = useState([]);
    const [teams, setTeams] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [filters, setFilters] = useState({ technician: '', team: '', equipment: '', status: '' });

    useEffect(() => {
        const fetchAll = async () => {
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

                const open = reqRes.data.filter(r => ['New', 'In Progress'].includes(r.status)).length;

                setStats({
                    totalEquipment: eqRes.data.length,
                    openRequests: open,
                    overdueRequests: overdue,
                    activeTeams: teamRes.data.length
                });

                setEquipment(eqRes.data);
                setRequests(reqRes.data);
                setTeams(teamRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data');
            }
        };
        fetchAll();
    }, []);

    const technicians = useMemo(() => {
        const all = teams.flatMap(t => t.members || []);
        const map = new Map();
        all.forEach(u => { if (!map.has(u._id)) map.set(u._id, u); });
        return Array.from(map.values());
    }, [teams]);

    const filteredRequests = useMemo(() => {
        return requests.filter(r => {
            if (filters.status && r.status !== filters.status) return false;
            if (filters.equipment && r.equipment?._id !== filters.equipment) return false;
            if (filters.team && r.assignedTeam?._id !== filters.team) return false;
            if (filters.technician && r.assignedTechnician?._id !== filters.technician) return false;
            return true;
        });
    }, [requests, filters]);

    const refreshRequests = async () => {
        const { data } = await axios.get('http://localhost:5000/api/requests');
        setRequests(data);
    };

    const handleMove = async (id, toStatus) => {
        // optimistic update
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status: toStatus } : r));
        try {
            await axios.put(`http://localhost:5000/api/requests/${id}`, { status: toStatus });
        } catch (e) {
            await refreshRequests();
        }
    };

    const handleAssign = async (req, technicianId) => {
        try {
            await axios.put(`http://localhost:5000/api/requests/${req._id}`, { assignedTechnician: technicianId });
            await refreshRequests();
        } catch (e) {
            console.error('Failed to assign technician');
        }
    };

    const handleScrap = async (req) => {
        try {
            await axios.put(`http://localhost:5000/api/requests/${req._id}`, { status: 'Scrapped' });
            await refreshRequests();
        } catch (e) {
            console.error('Failed to scrap');
        }
    };

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
            {/* Filters */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center"><Filter className="h-4 w-4 mr-2" /> Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-3">
                        <select className="border rounded px-2 py-1 text-sm" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
                            <option value="">Status: All</option>
                            {['New','In Progress','Repaired','Scrapped'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select className="border rounded px-2 py-1 text-sm" value={filters.technician} onChange={(e) => setFilters(f => ({ ...f, technician: e.target.value }))}>
                            <option value="">Technician: All</option>
                            {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <select className="border rounded px-2 py-1 text-sm" value={filters.team} onChange={(e) => setFilters(f => ({ ...f, team: e.target.value }))}>
                            <option value="">Team: All</option>
                            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <select className="border rounded px-2 py-1 text-sm" value={filters.equipment} onChange={(e) => setFilters(f => ({ ...f, equipment: e.target.value }))}>
                            <option value="">Equipment: All</option>
                            {equipment.map(eq => <option key={eq._id} value={eq._id}>{eq.name}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Manager Kanban */}
            <KanbanBoard
                role="Manager"
                items={filteredRequests}
                columns={['New','In Progress','Repaired','Scrapped']}
                technicians={technicians}
                onMove={handleMove}
                onAssignTechnician={handleAssign}
                onScrap={handleScrap}
            />
        </div>
    );
};

export default ManagerDashboard;
