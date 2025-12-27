import { DragDropContext, Draggable } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const KanbanBoard = ({
  role = 'User',
  items = [],
  columns = ['New','In Progress','Repaired','Scrapped'],
  technicians = [],
  onMove,
  onAssignTechnician,
  onScrap,
  onUpdateDuration,
  onAddNote
}) => {
  const getColumnItems = (status) => items.filter((r) => r.status === status);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    // Technician restrictions: cannot move to Scrapped; only forward allowed
    if (role === 'Technician') {
      if (destination.droppableId === 'Scrapped') return; // blocked
      const item = items.find((i) => i._id === draggableId);
      const allowed =
        (item?.status === 'New' && destination.droppableId === 'In Progress') ||
        (item?.status === 'In Progress' && destination.droppableId === 'Repaired');
      if (!allowed) return;
    }

    onMove?.(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn key={col} columnId={col} title={col} count={getColumnItems(col).length}>
            {getColumnItems(col).map((request, index) => (
              <Draggable key={request._id} draggableId={request._id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <KanbanCard
                      request={request}
                      role={role}
                      technicians={technicians}
                      onAssignTechnician={onAssignTechnician}
                      onScrap={onScrap}
                      onUpdateDuration={onUpdateDuration}
                      onAddNote={onAddNote}
                    />
                  </div>
                )}
              </Draggable>
            ))}
          </KanbanColumn>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
