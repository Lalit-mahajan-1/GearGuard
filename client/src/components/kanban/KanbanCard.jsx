import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { User, Calendar, Wrench, Trash2, Clock, MessageSquarePlus } from 'lucide-react';
import { format } from 'date-fns';

const priorityColor = (priority) => {
  if (priority === 'Critical') return 'border-l-red-500';
  if (priority === 'High') return 'border-l-orange-500';
  return 'border-l-blue-500';
};

const KanbanCard = ({
  request,
  role = 'User',
  technicians = [],
  onAssignTechnician,
  onScrap,
  onUpdateDuration,
  onAddNote
}) => {
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTech, setSelectedTech] = useState(request.assignedTechnician?._id || '');
  const [showWork, setShowWork] = useState(false);
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');

  const overdue = request.scheduledDate && new Date(request.scheduledDate) < new Date() && !['Repaired','Scrapped','Cancelled'].includes(request.status);

  return (
    <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 ${priorityColor(request.priority)}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="font-medium text-sm line-clamp-1">{request.subject}</div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Wrench className="h-3 w-3 mr-1" />
              {request.equipment?.name || 'Unknown Equipment'}
            </div>
            {request.assignedTechnician && (
              <div className="text-xs text-muted-foreground flex items-center">
                <User className="h-3 w-3 mr-1" />
                {request.assignedTechnician.name}
              </div>
            )}
            {request.scheduledDate && (
              <div className={`text-xs flex items-center ${overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(request.scheduledDate), 'MMM d, yyyy')}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge>{request.priority}</Badge>
            <Badge variant="outline">{request.status}</Badge>
            {request.status === 'Scrapped' && (
              <Badge className="bg-red-100 text-red-700 border-none" title="This equipment has been scrapped and is no longer usable.">Scrapped</Badge>
            )}
          </div>
        </div>

        {/* Manager actions: assign tech, scrap equipment */}
        {role === 'Manager' && (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="text-xs underline text-blue-600"
              onClick={() => setShowAssign((s) => !s)}
            >
              {showAssign ? 'Close Assign' : (request.assignedTechnician ? 'Reassign Technician' : 'Assign Technician')}
            </button>
            {request.status !== 'Scrapped' && (
              <button
                type="button"
                className="text-xs text-red-600 hover:text-red-700 flex items-center"
                onClick={() => onScrap?.(request)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Scrap
              </button>
            )}
          </div>
        )}

        {role === 'Manager' && showAssign && (
          <div className="flex items-center gap-2 pt-2">
            <select
              className="text-xs border rounded px-2 py-1 w-full"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">Select technician</option>
              {technicians.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="text-xs bg-blue-600 text-white rounded px-2 py-1"
              onClick={() => selectedTech && onAssignTechnician?.(request, selectedTech)}
            >
              Assign
            </button>
          </div>
        )}

        {/* Technician actions: add duration and note */}
        {role === 'Technician' && (
          <div className="pt-2">
            <button
              type="button"
              className="text-xs underline text-blue-600 flex items-center"
              onClick={() => setShowWork((s) => !s)}
            >
              <Clock className="h-3 w-3 mr-1" /> {showWork ? 'Close Work Log' : 'Add Duration / Remarks'}
            </button>
            {showWork && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="text-xs border rounded px-2 py-1 w-24"
                    placeholder="hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-xs bg-blue-600 text-white rounded px-2 py-1"
                    onClick={() => onUpdateDuration?.(request, Number(duration) || 0)}
                  >
                    Save
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="text-xs border rounded px-2 py-1 flex-1"
                    placeholder="Add remark"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-xs bg-gray-800 text-white rounded px-2 py-1 flex items-center"
                    onClick={() => note && onAddNote?.(request, note)}
                  >
                    <MessageSquarePlus className="h-3 w-3 mr-1" /> Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
