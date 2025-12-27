import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar } from 'lucide-react';

const WeeklyScheduleTable = ({ requests = [], selectedDate }) => {
    // Get the start of the week (Sunday)
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day;
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    };

    const weekStart = getWeekStart(selectedDate);
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(Date.UTC(
            weekStart.getUTCFullYear(),
            weekStart.getUTCMonth(),
            weekStart.getUTCDate() + i
        ));
        weekDays.push(date);
    }

    // Get all hours in a day
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Group requests by day and time
    const getRequestsForDayAndHour = (day, hour) => {
        return requests.filter(req => {
            if (!req.scheduledDate) return false;
            const reqDate = new Date(req.scheduledDate);
            const reqDay = new Date(Date.UTC(
                reqDate.getUTCFullYear(),
                reqDate.getUTCMonth(),
                reqDate.getUTCDate()
            ));
            
            return reqDay.getTime() === day.getTime();
        });
    };

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

    const formatDayHeader = (date) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatHour = (hour) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${ampm}`;
    };

    const allRequestsForWeek = requests.filter(req => {
        if (!req.scheduledDate) return false;
        const reqDate = new Date(req.scheduledDate);
        const reqUTC = new Date(Date.UTC(
            reqDate.getUTCFullYear(),
            reqDate.getUTCMonth(),
            reqDate.getUTCDate()
        ));
        
        return reqUTC >= weekStart && reqUTC < new Date(Date.UTC(
            weekStart.getUTCFullYear(),
            weekStart.getUTCMonth(),
            weekStart.getUTCDate() + 7
        ));
    });

    return (
        <Card style={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base" style={{ color: 'rgb(30, 33, 40)' }}>
                    <Calendar className="h-4 w-4 mr-2" style={{ color: 'rgb(42, 112, 255)' }} />
                    Weekly Schedule
                    <span className="ml-2 text-sm font-normal" style={{ color: 'rgb(130, 134, 145)' }}>
                        ({allRequestsForWeek.length} scheduled)
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {allRequestsForWeek.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(0, 0, 0, 0.08)' }}>
                                    <th className="text-left py-3 px-3 font-semibold w-20" style={{ color: 'rgb(90, 94, 105)' }}>
                                        Time
                                    </th>
                                    {weekDays.map((day, idx) => (
                                        <th 
                                            key={idx}
                                            className="text-center py-3 px-2 font-semibold"
                                            style={{
                                                color: 'rgb(90, 94, 105)',
                                                backgroundColor: day.getTime() === new Date(Date.UTC(
                                                    selectedDate.getUTCFullYear(),
                                                    selectedDate.getUTCMonth(),
                                                    selectedDate.getUTCDate()
                                                )).getTime() ? 'rgb(245, 246, 249)' : 'transparent'
                                            }}
                                        >
                                            {formatDayHeader(day)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {hours.map((hour) => (
                                    <tr key={hour} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                                        <td className="py-2 px-3 font-semibold text-xs" style={{ color: 'rgb(130, 134, 145)' }}>
                                            {formatHour(hour)}
                                        </td>
                                        {weekDays.map((day, dayIdx) => {
                                            const dayRequests = getRequestsForDayAndHour(day, hour);
                                            const isSelectedDay = day.getTime() === new Date(Date.UTC(
                                                selectedDate.getUTCFullYear(),
                                                selectedDate.getUTCMonth(),
                                                selectedDate.getUTCDate()
                                            )).getTime();
                                            
                                            return (
                                                <td 
                                                    key={dayIdx}
                                                    className="py-2 px-2 align-top"
                                                    style={{
                                                        backgroundColor: isSelectedDay ? 'rgb(245, 246, 249)' : 'transparent',
                                                        minHeight: '60px'
                                                    }}
                                                >
                                                    {dayRequests.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {dayRequests.map((req) => (
                                                                <div
                                                                    key={req._id}
                                                                    className="p-1 rounded text-xs truncate"
                                                                    title={req.subject}
                                                                    style={{
                                                                        backgroundColor: getPriorityColor(req.priority).bg,
                                                                        color: getPriorityColor(req.priority).text,
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {req.subject}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'rgb(245, 246, 249)' }}>-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                            <p style={{ color: 'rgb(90, 94, 105)' }}>No scheduled maintenance this week</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WeeklyScheduleTable;
