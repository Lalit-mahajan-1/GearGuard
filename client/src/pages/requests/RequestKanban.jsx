import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge'; // I'll create Badge real quick after this
import { format } from 'date-fns';
import { Plus, User, Calendar, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const columns = {
    'New': { name: 'New Request', color: 'bg-blue-50' },
    'In Progress': { name: 'In Progress', color: 'bg-yellow-50' },
    'Repaired': { name: 'Repaired', color: 'bg-green-50' },
    'Scrapped': { name: 'Scrapped', color: 'bg-red-50' }
};

const RequestKanban = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/requests');
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            // Optimistic Update
            const updatedRequests = requests.map(req =>
                req._id === draggableId ? { ...req, status: destination.droppableId } : req
            );
            setRequests(updatedRequests);

            // API Call
            try {
                await axios.put(`http://localhost:5000/api/requests/${draggableId}`, {
                    status: destination.droppableId
                });
            } catch (error) {
                console.error("Failed to update status", error);
                fetchRequests(); // Revert on error
            }
        }
    };

    // Helper to filter requests by column
    const getColumnRequests = (status) => requests.filter(r => r.status === status);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Maintenance Board</h1>
                    <p className="text-muted-foreground">Manage and track maintenance requests</p>
                </div>
                {/* Link to create page or modal trigger */}
                <Link to="/requests/create">
                    <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
                </Link>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                    {Object.entries(columns).map(([columnId, column]) => (
                        <div key={columnId} className={`flex-1 min-w-[300px] flex flex-col rounded-lg border bg-gray-50/50`}>
                            <div className="p-4 border-b bg-white rounded-t-lg sticky top-0 z-10 flex justify-between items-center">
                                <h3 className="font-semibold">{column.name}</h3>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                                    {getColumnRequests(columnId).length}
                                </span>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 p-4 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                                    >
                                        {getColumnRequests(columnId).map((request, index) => (
                                            <Draggable key={request._id} draggableId={request._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-l-4 ${request.priority === 'Critical' ? 'border-l-red-500' :
                                                                request.priority === 'High' ? 'border-l-orange-500' : 'border-l-blue-500'
                                                            }`}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-medium text-sm line-clamp-1">{request.subject}</span>
                                                            </div>

                                                            <div className="text-xs text-muted-foreground mb-3 space-y-1">
                                                                <div className="flex items-center">
                                                                    <Wrench className="h-3 w-3 mr-1" />
                                                                    {request.equipment?.name || 'Unknown Equipment'}
                                                                </div>
                                                                {request.assignedTechnician && (
                                                                    <div className="flex items-center">
                                                                        <User className="h-3 w-3 mr-1" />
                                                                        {request.assignedTechnician.name}
                                                                    </div>
                                                                )}
                                                                {request.scheduledDate && (
                                                                    <div className={`flex items-center ${new Date(request.scheduledDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                                                        <Calendar className="h-3 w-3 mr-1" />
                                                                        {format(new Date(request.scheduledDate), 'MMM d, yyyy')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default RequestKanban;
