import TaskCard from "./TaskCard";
import { Droppable } from "react-beautiful-dnd";
import AddTaskForm from "./AddTaskForm";

function Column({ title, tasks, onTaskAdded, boardId, setTasks }) {
  return (
    <div className="w-full sm:w-1/3 bg-white p-4 rounded-lg text-gray-900 flex flex-col">
      <h3 className="text-3xl flex justify-center font-semibold text-indigo-500 mb-3">
        {title}
      </h3>

      <Droppable
        isCombineEnabled={false}
        isDropDisabled={false}
        droppableId={title}
        ignoreContainerClipping={false}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[150px] p-2 rounded-md border border-dashed transition-colors ease-in-out duration-200 ${
              snapshot.isDraggingOver
                ? "bg-blue-50"
                : "bg-white border-gray-300"
            } flex-grow`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onDelete={(deletedTaskId) => {
                  setTasks((prev) => ({
                    ...prev,
                    [title]: prev[title].filter((t) => t._id !== deletedTaskId),
                  }));
                }}
              />
            ))}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-center text-gray-400 italic">
                Drop a task here
              </p>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* 👇 Add task form */}
      <div className="mt-4">
        <AddTaskForm
          status={title}
          boardId={boardId}
          // onAdd={(newTask) => onTaskAdded(newTask, title)}
        />
      </div>
    </div>
  );
}

export default Column;
