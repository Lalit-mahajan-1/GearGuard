import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar, Filter, Download, X, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import CalendarView from '../../components/maintenance-calendar/CalendarView';
import ScheduledRequestsTable from '../../components/maintenance-calendar/ScheduledRequestsTable';
import WeeklyScheduleTable from '../../components/maintenance-calendar/WeeklyScheduleTable';

const MaintenanceCalendar = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filters, setFilters] = useState({
        priority: 'All',
        type: 'All',
        status: 'All'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch scheduled maintenance requests
    useEffect(() => {
        const fetchScheduledRequests = async () => {
            try {
                setLoading(true);
                console.log('Fetching scheduled requests for user:', { role: user.role, userId: user._id });
                const { data } = await axios.get('http://localhost:5000/api/requests/calendar/scheduled', {
                    params: {
                        role: user.role,
                        userId: user._id
                    }
                });
                console.log('Fetched requests:', data);
                setRequests(data);
                setFilteredRequests(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch scheduled requests:', err);
                setError('Failed to load maintenance schedule');
            } finally {
                setLoading(false);
            }
        };

        if (user._id) {
            fetchScheduledRequests();
        }
    }, [user._id, user.role]);

    // Helper function to normalize dates to UTC for comparison
    const getUTCDateString = (date) => {
        const d = new Date(date);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    };

    // Apply filters and date selection
    useEffect(() => {
        let filtered = requests;

        // Filter by selected date (UTC comparison)
        const selectedDateUTC = getUTCDateString(selectedDate);
        console.log('Selected date UTC:', selectedDateUTC);
        console.log('All requests:', requests);
        
        filtered = filtered.filter(req => {
            const reqDateUTC = getUTCDateString(req.scheduledDate);
            console.log('Comparing:', reqDateUTC, '===', selectedDateUTC, '→', reqDateUTC === selectedDateUTC);
            return reqDateUTC === selectedDateUTC;
        });
        
        console.log('Filtered after date:', filtered);

        // Filter by priority
        if (filters.priority !== 'All') {
            filtered = filtered.filter(req => req.priority === filters.priority);
        }

        // Filter by type
        if (filters.type !== 'All') {
            filtered = filtered.filter(req => req.type === filters.type);
        }

        // Filter by status
        if (filters.status !== 'All') {
            filtered = filtered.filter(req => req.status === filters.status);
        }

        setFilteredRequests(filtered);
    }, [selectedDate, filters, requests]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            priority: 'All',
            type: 'All',
            status: 'All'
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/requests/calendar/scheduled', {
                params: {
                    role: user.role,
                    userId: user._id
                }
            });
            setRequests(data);
            console.log('Calendar refreshed with latest data:', data);
        } catch (err) {
            console.error('Failed to refresh data:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredRequests.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Request ID', 'Equipment', 'Priority', 'Type', 'Status', 'Scheduled Date', 'Technician', 'Team'];
        const rows = filteredRequests.map(req => [
            req.requestNumber,
            req.equipment?.name || 'N/A',
            req.priority,
            req.type,
            req.status,
            new Date(req.scheduledDate).toLocaleDateString(),
            req.assignedTechnician?.name || 'Unassigned',
            req.assignedTeam?.name || 'Unassigned'
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maintenance-calendar-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(245, 246, 249)' }}>
                        <Calendar className="h-6 w-6" style={{ color: 'rgb(42, 112, 255)' }} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: 'rgb(30, 33, 40)' }}>
                            Maintenance Calendar
                        </h1>
                        <p className="text-sm" style={{ color: 'rgb(130, 134, 145)' }}>
                            Schedule and track preventive & corrective maintenance
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleRefresh}
                        className="flex items-center gap-2"
                        disabled={refreshing}
                        style={{
                            backgroundColor: 'rgb(245, 246, 249)',
                            color: 'rgb(42, 112, 255)',
                            border: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2"
                        style={{
                            backgroundColor: 'rgb(42, 112, 255)',
                            color: 'white'
                        }}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar Section */}
                <div className="lg:col-span-1">
                    <Card style={{
                        backgroundColor: 'rgb(255, 255, 255)',
                        border: 'none',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}>
                        <CardContent className="p-4">
                            <CalendarView
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                                scheduledDates={requests.map(r => new Date(r.scheduledDate))}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Table Section */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Filters Card */}
                    <Card style={{
                        backgroundColor: 'rgb(255, 255, 255)',
                        border: 'none',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-base" style={{ color: 'rgb(30, 33, 40)' }}>
                                <Filter className="h-4 w-4 mr-2" style={{ color: 'rgb(42, 112, 255)' }} />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {/* Priority Filter */}
                                <div>
                                    <label className="text-xs font-semibold block mb-2" style={{ color: 'rgb(90, 94, 105)' }}>
                                        Priority
                                    </label>
                                    <select
                                        value={filters.priority}
                                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm border"
                                        style={{
                                            backgroundColor: 'rgb(245, 247, 250)',
                                            borderColor: 'rgba(0, 0, 0, 0.08)',
                                            color: 'rgb(30, 33, 40)'
                                        }}
                                    >
                                        <option value="All">All</option>
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>

                                {/* Type Filter */}
                                <div>
                                    <label className="text-xs font-semibold block mb-2" style={{ color: 'rgb(90, 94, 105)' }}>
                                        Type
                                    </label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm border"
                                        style={{
                                            backgroundColor: 'rgb(245, 247, 250)',
                                            borderColor: 'rgba(0, 0, 0, 0.08)',
                                            color: 'rgb(30, 33, 40)'
                                        }}
                                    >
                                        <option value="All">All</option>
                                        <option value="Preventive">Preventive</option>
                                        <option value="Corrective">Corrective</option>
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="text-xs font-semibold block mb-2" style={{ color: 'rgb(90, 94, 105)' }}>
                                        Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm border"
                                        style={{
                                            backgroundColor: 'rgb(245, 247, 250)',
                                            borderColor: 'rgba(0, 0, 0, 0.08)',
                                            color: 'rgb(30, 33, 40)'
                                        }}
                                    >
                                        <option value="All">All</option>
                                        <option value="New">New</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Repaired">Repaired</option>
                                        <option value="Scrapped">Scrapped</option>
                                    </select>
                                </div>
                            </div>

                            {(filters.priority !== 'All' || filters.type !== 'All' || filters.status !== 'All') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-2 text-sm"
                                    style={{ color: 'rgb(42, 112, 255)' }}
                                >
                                    <X className="h-3 w-3" />
                                    Reset Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Requests Table Card */}
                    <Card style={{
                        backgroundColor: 'rgb(255, 255, 255)',
                        border: 'none',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base" style={{ color: 'rgb(30, 33, 40)' }}>
                                Scheduled Requests
                                <span className="ml-2 text-sm font-normal" style={{ color: 'rgb(130, 134, 145)' }}>
                                    ({filteredRequests.length})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(42, 112, 255)' }}></div>
                                        <p className="mt-4" style={{ color: 'rgb(90, 94, 105)' }}>Loading requests...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <p style={{ color: 'rgb(230, 74, 74)' }} className="font-semibold">{error}</p>
                                    </div>
                                </div>
                            ) : filteredRequests.length > 0 ? (
                                <ScheduledRequestsTable requests={filteredRequests} />
                            ) : (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                        <p style={{ color: 'rgb(90, 94, 105)' }}>No scheduled requests for this date</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Weekly Schedule Table */}
            <WeeklyScheduleTable requests={requests} selectedDate={selectedDate} />
        </div>
    );
};

export default MaintenanceCalendar;
