import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Users, UserPlus, Trash, Shield, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '123456', role: 'User', team: '' });
    const [showForm, setShowForm] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const fetchTeams = async () => axios.get('http://localhost:5000/api/teams').then(res => setTeams(res.data));

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users', newUser);
            setShowForm(false);
            setNewUser({ name: '', email: '', password: '123456', role: 'User', team: '' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure?')) {
            await axios.delete(`http://localhost:5000/api/users/${id}`);
            fetchUsers();
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                {/* ... other stats ... */}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Management</CardTitle>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : <><UserPlus className="mr-2 h-4 w-4" /> Add User</>}
                    </Button>
                </CardHeader>
                <CardContent>
                    {showForm && (
                        <form onSubmit={handleCreateUser} className="mb-6 border p-4 rounded-md space-y-4 bg-gray-50">
                            <h3 className="font-semibold">Add New User</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="User">User</option>
                                    <option value="Technician">Technician</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                {newUser.role === 'Technician' && (
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newUser.team}
                                        onChange={e => setNewUser({ ...newUser, team: e.target.value })}
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <Button type="submit">Create User</Button>
                        </form>
                    )}

                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Team</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-4">
                                            <div className="font-medium">{u.name}</div>
                                            <div className="text-muted-foreground text-xs">{u.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={u.role === 'Admin' ? 'destructive' : 'secondary'}>{u.role}</Badge>
                                        </td>
                                        <td className="p-4">{u.team?.name || '-'}</td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u._id)}>
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
