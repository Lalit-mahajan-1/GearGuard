import { Droppable } from '@hello-pangea/dnd';

const KanbanColumn = ({ columnId, title, count, children }) => {
  return (
    <div className="flex-1 min-w-[300px] flex flex-col rounded-lg border bg-gray-50/50">
      <div className="p-4 border-b bg-white rounded-t-lg sticky top-0 z-10 flex justify-between items-center">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{count}</span>
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 p-4 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
