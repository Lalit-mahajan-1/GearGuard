import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users } from 'lucide-react';

const TeamsList = () => {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/teams').then(res => setTeams(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Maintenance Teams</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map(team => (
                    <Card key={team._id}>
                        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{team.description}</p>
                            <div className="mt-4">
                                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                                    Members: {team.members?.length || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TeamsList;
