import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Wrench, ClipboardList, User, MapPin, Calendar, Shield, Zap, Users } from 'lucide-react';
import { format } from 'date-fns';
import EquipmentMaintenanceList from '../../components/maintenance-calendar/EquipmentMaintenanceList';

const EquipmentDetail = () => {
    const { id } = useParams();
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [technicians, setTechnicians] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eqRes, teamRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/equipment/${id}`),
                    axios.get(`http://localhost:5000/api/teams`)
                ]);

                setEquipment(eqRes.data);

                // Flatten all members from all teams to get technician list
                const allTechs = teamRes.data.flatMap(t => t.members || []);
                // Remove duplicates by ID
                const uniqueTechs = Array.from(new Map(allTechs.map(t => [t._id, t])).values());
                setTechnicians(uniqueTechs);

                setLoading(false);
            } catch (err) {
                console.error('Failed to load data:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleTechnicianChange = async (techId) => {
        if (!equipment) return;
        setUpdating(true);
        try {
            const { data } = await axios.put(`http://localhost:5000/api/equipment/${id}`, {
                defaultTechnician: techId
            });
            setEquipment(prev => ({ ...prev, defaultTechnician: data.defaultTechnician }));

            // Re-fetch to ensure populated fields are correct if needed, 
            // but for now we just updated the state optimistically or via response?
            // The response from update might not be populated. 
            // Let's manually update the populated field in state for the UI
            if (techId) {
                const selectedTech = technicians.find(t => t._id === techId);
                setEquipment(prev => ({ ...prev, defaultTechnician: selectedTech }));
            } else {
                setEquipment(prev => ({ ...prev, defaultTechnician: null }));
            }

        } catch (error) {
            console.error("Failed to update technician", error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(42, 112, 255)' }}></div>
                <p className="mt-4" style={{ color: 'rgb(90, 94, 105)' }}>Loading equipment...</p>
            </div>
        </div>
    );

    if (!equipment) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <p style={{ color: 'rgb(230, 74, 74)' }} className="font-semibold">Equipment not found</p>
            </div>
        </div>
    );

    const getStatusColor = (status) => {
        const colors = {
            'Operational': { bg: 'rgb(230, 248, 240)', text: 'rgb(62, 185, 122)' },
            'Down': { bg: 'rgb(254, 230, 230)', text: 'rgb(230, 74, 74)' },
            'Under Maintenance': { bg: 'rgb(255, 243, 230)', text: 'rgb(255, 161, 46)' },
            'Scrapped': { bg: 'rgb(245, 246, 249)', text: 'rgb(90, 94, 105)' }
        };
        return colors[status] || colors['Operational'];
    };

    const isWarrantyActive = equipment.warrantyExpiration && new Date(equipment.warrantyExpiration) > new Date();

    const statusColor = getStatusColor(equipment.status);

    return (
        <div className="space-y-6 pb-8">
            {showMaintenanceModal && (
                <EquipmentMaintenanceList
                    equipmentId={id}
                    equipmentName={equipment.name}
                    onClose={() => setShowMaintenanceModal(false)}
                />
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'rgb(30, 33, 40)' }}>{equipment.name}</h1>
                    <p style={{ color: 'rgb(130, 134, 145)' }} className="text-sm mt-1">{equipment.description || 'No description available'}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMaintenanceModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                        style={{
                            backgroundColor: 'rgb(42, 112, 255)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        <Wrench className="h-4 w-4" />
                        View Maintenance
                    </button>
                    <Link to={`/requests?equipment=${id}`}>
                        <Button className="flex items-center gap-2" style={{
                            backgroundColor: 'rgb(42, 112, 255)',
                            color: 'white'
                        }}>
                            <ClipboardList className="h-4 w-4" />
                            View Requests ({equipment.openRequestsCount || 0})
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Basic Info Card */}
                <Card style={{
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2" style={{ color: 'rgb(30, 33, 40)' }}>
                            <Wrench className="h-4 w-4" style={{ color: 'rgb(42, 112, 255)' }} />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Serial Number</span>
                            <p style={{ color: 'rgb(30, 33, 40)' }} className="font-mono text-sm">{equipment.serialNumber}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Category</span>
                            <p style={{ color: 'rgb(30, 33, 40)' }}>{equipment.category || 'Not specified'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Status</span>
                            <Badge style={{
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                                border: 'none'
                            }}>
                                {equipment.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Location & Dates Card */}
                <Card style={{
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2" style={{ color: 'rgb(30, 33, 40)' }}>
                            <MapPin className="h-4 w-4" style={{ color: 'rgb(42, 112, 255)' }} />
                            Location & Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Location</span>
                            <p style={{ color: 'rgb(30, 33, 40)' }}>{equipment.location}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Purchase Date</span>
                            <p style={{ color: 'rgb(30, 33, 40)' }}>
                                {equipment.purchaseDate ? format(new Date(equipment.purchaseDate), 'MMM dd, yyyy') : 'Not recorded'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Added Date</span>
                            <p style={{ color: 'rgb(30, 33, 40)' }}>
                                {equipment.createdAt ? format(new Date(equipment.createdAt), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Warranty Card */}
                <Card style={{
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2" style={{ color: 'rgb(30, 33, 40)' }}>
                            <Shield className="h-4 w-4" style={{ color: 'rgb(42, 112, 255)' }} />
                            Warranty Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Warranty Expiration</span>
                            <p style={{ color: 'rgb(30, 33, 40)' }}>
                                {equipment.warrantyExpiration
                                    ? format(new Date(equipment.warrantyExpiration), 'MMM dd, yyyy')
                                    : 'No warranty info'
                                }
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold block mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Warranty Status</span>
                            {equipment.warrantyExpiration ? (
                                <Badge style={{
                                    backgroundColor: isWarrantyActive ? 'rgb(230, 248, 240)' : 'rgb(254, 230, 230)',
                                    color: isWarrantyActive ? 'rgb(62, 185, 122)' : 'rgb(230, 74, 74)',
                                    border: 'none'
                                }}>
                                    {isWarrantyActive ? '✓ Active' : '✗ Expired'}
                                </Badge>
                            ) : (
                                <Badge style={{
                                    backgroundColor: 'rgb(245, 246, 249)',
                                    color: 'rgb(90, 94, 105)',
                                    border: 'none'
                                }}>
                                    Unknown
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assignment & Team Card */}
            <Card style={{
                backgroundColor: 'rgb(255, 255, 255)',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: 'rgb(30, 33, 40)' }}>
                        <Users className="h-4 w-4" style={{ color: 'rgb(42, 112, 255)' }} />
                        Team & Assignment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(245, 246, 249)' }}>
                            <Users className="h-5 w-5" style={{ color: 'rgb(42, 112, 255)' }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Assigned Team</p>
                            <p style={{ color: 'rgb(30, 33, 40)' }} className="font-medium">{equipment.maintenanceTeam?.name || 'No team assigned'}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(245, 246, 249)' }}>
                            <User className="h-5 w-5" style={{ color: 'rgb(42, 112, 255)' }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1" style={{ color: 'rgb(90, 94, 105)' }}>Primary Technician</p>
                            <p style={{ color: 'rgb(30, 33, 40)' }} className="font-medium">{equipment.defaultTechnician?.name || 'Not assigned'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Equipment Image */}
            {equipment.image && (
                <Card style={{
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}>
                    <CardHeader className="pb-3 border-b border-slate-50">
                        <CardTitle className="text-base flex items-center gap-2" style={{ color: 'rgb(30, 33, 40)' }}>
                            <Zap className="h-4 w-4" style={{ color: 'rgb(42, 112, 255)' }} />
                            Equipment Image
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex justify-center items-center rounded-xl bg-slate-50 border border-slate-100 p-4 h-[400px]">
                            <img
                                src={equipment.image}
                                alt={equipment.name}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div >
    );
};

export default EquipmentDetail;
