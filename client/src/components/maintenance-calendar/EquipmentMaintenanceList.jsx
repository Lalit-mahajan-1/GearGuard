import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, Wrench, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const EquipmentMaintenanceList = ({ equipmentId, equipmentName, onClose }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // Get user info from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role || '');
        setUserId(user._id || '');
    }, []);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `http://localhost:5000/api/requests?equipment=${equipmentId}`
                );
                setRequests(data || []);
            } catch (err) {
                console.error('Failed to fetch maintenance requests:', err);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

        if (equipmentId) {
            fetchRequests();
        }
    }, [equipmentId]);

    // Filter requests based on user role
    const filteredByRole = userRole === 'Technician'
        ? requests.filter(r => r.assignedTechnician?._id === userId)
        : requests;

    // Apply additional filters
    const filteredRequests = filteredByRole.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    const getStatusColor = (status) => {
        const colors = {
            'Pending': { bg: 'rgb(255, 243, 230)', text: 'rgb(255, 161, 46)' },
            'Assigned': { bg: 'rgb(230, 242, 255)', text: 'rgb(42, 112, 255)' },
            'In Progress': { bg: 'rgb(230, 248, 240)', text: 'rgb(62, 185, 122)' },
            'Completed': { bg: 'rgb(245, 246, 249)', text: 'rgb(90, 94, 105)' }
        };
        return colors[status] || colors['Pending'];
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': { bg: 'rgb(254, 230, 230)', text: 'rgb(230, 74, 74)' },
            'Medium': { bg: 'rgb(255, 243, 230)', text: 'rgb(255, 161, 46)' },
            'Low': { bg: 'rgb(230, 248, 240)', text: 'rgb(62, 185, 122)' }
        };
        return colors[priority] || colors['Low'];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{
                backgroundColor: 'rgb(255, 255, 255)',
                border: 'none',
                boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
            }}>
                {/* Header */}
                <CardHeader className="border-b border-slate-200 pb-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(230, 242, 255)' }}>
                            <Wrench className="h-5 w-5" style={{ color: 'rgb(42, 112, 255)' }} />
                        </div>
                        <div>
                            <CardTitle className="text-xl" style={{ color: 'rgb(30, 33, 40)' }}>
                                Maintenance Requests
                            </CardTitle>
                            <p className="text-sm" style={{ color: 'rgb(90, 94, 105)' }}>
                                {equipmentName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-5 w-5" style={{ color: 'rgb(90, 94, 105)' }} />
                    </button>
                </CardHeader>

                {/* Filter Tabs */}
                <div className="flex gap-2 p-4 border-b border-slate-200 bg-slate-50 overflow-x-auto">
                    {['all', 'Pending', 'Assigned', 'In Progress', 'Completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm"
                            style={{
                                backgroundColor: filter === status ? 'rgb(42, 112, 255)' : 'rgb(245, 246, 249)',
                                color: filter === status ? 'white' : 'rgb(90, 94, 105)',
                                border: 'none'
                            }}
                        >
                            {status === 'all' ? 'All Requests' : status}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'rgb(42, 112, 255)' }}></div>
                                <p className="mt-3" style={{ color: 'rgb(90, 94, 105)' }}>Loading requests...</p>
                            </div>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-12 w-12 mb-3" style={{ color: 'rgb(130, 134, 145)' }} />
                            <p style={{ color: 'rgb(90, 94, 105)' }} className="text-center">
                                {userRole === 'Technician'
                                    ? 'No maintenance requests assigned to you for this equipment'
                                    : 'No maintenance requests found for this equipment'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRequests.map(request => (
                                <div
                                    key={request._id}
                                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                                    style={{ backgroundColor: 'rgb(250, 251, 252)' }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold" style={{ color: 'rgb(30, 33, 40)' }}>
                                                {request.subject}
                                            </h3>
                                            <p className="text-sm mt-1" style={{ color: 'rgb(90, 94, 105)' }}>
                                                {request.description}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Badge style={{
                                                backgroundColor: getStatusColor(request.status).bg,
                                                color: getStatusColor(request.status).text,
                                                border: 'none'
                                            }}>
                                                {request.status}
                                            </Badge>
                                            <Badge style={{
                                                backgroundColor: getPriorityColor(request.priority).bg,
                                                color: getPriorityColor(request.priority).text,
                                                border: 'none'
                                            }}>
                                                {request.priority}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-3 border-t border-slate-100">
                                        <div>
                                            <span style={{ color: 'rgb(90, 94, 105)' }} className="text-xs font-semibold block mb-1">
                                                Type
                                            </span>
                                            <p style={{ color: 'rgb(30, 33, 40)' }}>{request.type}</p>
                                        </div>
                                        <div>
                                            <span style={{ color: 'rgb(90, 94, 105)' }} className="text-xs font-semibold block mb-1">
                                                Assigned Technician
                                            </span>
                                            <p style={{ color: 'rgb(30, 33, 40)' }}>
                                                {request.assignedTechnician?.name || 'Unassigned'}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ color: 'rgb(90, 94, 105)' }} className="text-xs font-semibold block mb-1">
                                                Created Date
                                            </span>
                                            <p style={{ color: 'rgb(30, 33, 40)' }}>
                                                {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        {request.scheduledDate && (
                                            <div>
                                                <span style={{ color: 'rgb(90, 94, 105)' }} className="text-xs font-semibold block mb-1">
                                                    Scheduled Date
                                                </span>
                                                <p style={{ color: 'rgb(30, 33, 40)' }}>
                                                    {format(new Date(request.scheduledDate), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
                    <p className="text-sm" style={{ color: 'rgb(90, 94, 105)' }}>
                        Showing {filteredRequests.length} of {filteredByRole.length} requests
                        {userRole === 'Technician' && ' (filtered to your assignments)'}
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default EquipmentMaintenanceList;
