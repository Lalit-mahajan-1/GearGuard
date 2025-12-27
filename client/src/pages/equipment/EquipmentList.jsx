import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Plus, Search } from 'lucide-react';

const EquipmentList = () => {
    const [equipment, setEquipment] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/equipment').then(res => setEquipment(res.data));
    }, []);

    const filteredEquipment = equipment.filter(eq =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Equipment</h1>
                <Link to="/equipment/create">
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Equipment</Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="text-muted-foreground h-5 w-5" />
                <Input
                    placeholder="Search equipment..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEquipment.map((eq) => (
                    <Link key={eq._id} to={`/equipment/${eq._id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">{eq.name}</CardTitle>
                                <Badge variant={eq.status === 'Operational' ? 'default' : 'destructive'}>
                                    {eq.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                                    <p>SN: {eq.serialNumber}</p>
                                    <p>Team: {eq.maintenanceTeam?.name || 'Unassigned'}</p>
                                    <p>Location: {eq.location}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default EquipmentList;
