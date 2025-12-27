import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Wrench, ClipboardList, User } from 'lucide-react';
import { format } from 'date-fns';

const EquipmentDetail = () => {
    const { id } = useParams();
    const [equipment, setEquipment] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/equipment/${id}`).then(res => setEquipment(res.data));
    }, [id]);

    if (!equipment) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Top Stats / Smart Buttons */}
            <div className="flex justify-end space-x-4">
                <Link to={`/requests?equipment=${id}`}>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center min-w-[120px]">
                        <ClipboardList className="h-5 w-5 mb-1" />
                        <span className="font-bold text-lg">{equipment.openRequestsCount || 0}</span>
                        <span className="text-xs text-muted-foreground">Maintenance</span>
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Equipment Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground">Namr</span>
                                <p>{equipment.name}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Serial Number</span>
                                <p>{equipment.serialNumber}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Status</span>
                                <div><Badge>{equipment.status}</Badge></div>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Category</span>
                                <p>{equipment.category || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Purchase Date</span>
                                <p>{equipment.purchaseDate ? format(new Date(equipment.purchaseDate), 'PPP') : 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Assignment & Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <UsersIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Assigned Team</p>
                                <p className="text-sm text-muted-foreground">{equipment.maintenanceTeam?.name || 'None'}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Assigned To</p>
                                <p className="text-sm text-muted-foreground">{equipment.assignedTo?.name || 'Unassigned'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const UsersIcon = ({ className }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

export default EquipmentDetail;
