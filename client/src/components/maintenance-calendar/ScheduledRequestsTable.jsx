import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const ScheduledRequestsTable = ({ requests = [] }) => {
    const getPriorityColor = (priority) => {
        const colors = {
            'Low': { bg: 'rgb(245, 246, 249)', text: 'rgb(90, 94, 105)' },
            'Normal': { bg: 'rgb(245, 246, 249)', text: 'rgb(90, 94, 105)' },
            'High': { bg: 'rgb(255, 236, 205)', text: 'rgb(255, 161, 46)' },
            'Critical': { bg: 'rgb(254, 230, 230)', text: 'rgb(230, 74, 74)' }
        };
        return colors[priority] || colors['Normal'];
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': { bg: 'rgb(230, 243, 255)', text: 'rgb(42, 112, 255)' },
            'In Progress': { bg: 'rgb(255, 243, 230)', text: 'rgb(255, 161, 46)' },
            'Repaired': { bg: 'rgb(230, 248, 240)', text: 'rgb(62, 185, 122)' },
            'Scrapped': { bg: 'rgb(254, 230, 230)', text: 'rgb(230, 74, 74)' },
            'Cancelled': { bg: 'rgb(245, 246, 249)', text: 'rgb(90, 94, 105)' }
        };
        return colors[status] || colors['New'];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(90, 94, 105)' }}>
                            Request ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(90, 94, 105)' }}>
                            Equipment
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(90, 94, 105)' }}>
                            Priority
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(90, 94, 105)' }}>
                            Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(90, 94, 105)' }}>
                            Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(90, 94, 105)' }}>
                            Technician
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(90, 94, 105)' }}>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request, index) => {
                        const priorityColor = getPriorityColor(request.priority);
                        const statusColor = getStatusColor(request.status);

                        return (
                            <tr
                                key={request._id}
                                style={{
                                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgb(245, 247, 250)',
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                                    transition: 'background-color 0.2s'
                                }}
                                className="hover:bg-opacity-75"
                            >
                                <td className="py-4 px-4" style={{ color: 'rgb(30, 33, 40)' }}>
                                    <span className="font-semibold">{request.requestNumber}</span>
                                </td>
                                <td className="py-4 px-4" style={{ color: 'rgb(90, 94, 105)' }}>
                                    {request.equipment?.name || 'N/A'}
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: priorityColor.bg,
                                            color: priorityColor.text
                                        }}
                                    >
                                        {request.priority}
                                    </span>
                                </td>
                                <td className="py-4 px-4" style={{ color: 'rgb(90, 94, 105)' }}>
                                    {request.type}
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: statusColor.bg,
                                            color: statusColor.text
                                        }}
                                    >
                                        {request.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4" style={{ color: 'rgb(90, 94, 105)' }}>
                                    {request.assignedTechnician?.name || 'Unassigned'}
                                </td>
                                <td className="py-4 px-4">
                                    <Link
                                        to={`/requests/${request._id}`}
                                        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                                        style={{ color: 'rgb(42, 112, 255)' }}
                                    >
                                        View
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduledRequestsTable;
