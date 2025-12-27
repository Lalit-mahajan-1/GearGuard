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
                    <Card key={team._id} className="relative group overflow-visible">
                        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{team.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                                    Members: {team.members?.length || 0}
                                </span>

                                {/* Hover Info Icon */}
                                <div className="relative">
                                    <div className="cursor-pointer p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                                        <div className="flex items-center justify-center w-5 h-5 border border-current rounded-full text-[10px] font-serif font-bold italic">
                                            i
                                        </div>
                                    </div>

                                    {/* Tooltip Popup */}
                                    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                        <div className="font-semibold mb-1 border-b border-slate-600 pb-1 text-slate-200">Team Members</div>
                                        {team.members && team.members.length > 0 ? (
                                            <ul className="space-y-1">
                                                {team.members.map(m => (
                                                    <li key={m._id} className="truncate">• {m.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-slate-400 italic">No members assigned</span>
                                        )}
                                        {/* Arrow */}
                                        <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TeamsList;
