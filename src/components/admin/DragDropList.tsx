import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface SortableItem {
  id: number;
  display_order: number;
  [key: string]: any;
}

interface DragDropListProps<T extends SortableItem> {
  items: T[];
  onReorder: (items: T[]) => Promise<void>;
  renderItem: (item: T, dragHandleProps?: any) => React.ReactNode;
  className?: string;
}

export function DragDropList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  className = "",
}: DragDropListProps<T>) {
  const [localItems, setLocalItems] = useState<T[]>(items);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Update local state when items prop changes
  useState(() => {
    setLocalItems(items);
  });

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(localItems, oldIndex, newIndex);

      // Update display_order for all items
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        display_order: index + 1,
      }));

      setLocalItems(updatedItems);

      try {
        await onReorder(updatedItems);
      } catch (error) {
        console.error("Failed to reorder items:", error);
        // Revert on error
        setLocalItems(items);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {localItems.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              isDragging={isDragging}
              renderItem={(dragHandleProps) =>
                renderItem(item, dragHandleProps)
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  renderItem,
  isDragging,
}: {
  id: number;
  renderItem: (dragHandleProps: any) => React.ReactNode;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentDragging ? 0.5 : 1,
  };

  // Pass drag handle props to the render function
  const dragHandleProps = {
    ...attributes,
    ...listeners,
    style: { cursor: isDragging ? "grabbing" : "grab" },
  };

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(dragHandleProps)}
    </div>
  );
}
