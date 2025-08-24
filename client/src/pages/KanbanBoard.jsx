import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import Column from "../Components/Column";
import { DragDropContext } from "react-beautiful-dnd";
import io from "socket.io-client";
import InviteForm from "../Components/InviteForm";
import ActivityTimeline from "../Components/ActivityTimeline";

const initialData = { Todo: [], "In Progress": [], Done: [] };

function KanbanBoard() {
  const socket = useRef(null);
  const { id: boardId } = useParams();
  const [tasks, setTasks] = useState(initialData);
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        const res = await API.get(`/tasks?boardId=${boardId}`);
        const grouped = { Todo: [], "In Progress": [], Done: [] };
        for (const task of res.data) {
          const status = grouped[task.status] ? task.status : "Todo";
          grouped[status].push(task);
        }
        setTasks(grouped);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchInitialTasks();
    socket.current = io("https://kanban-board-jlwg.onrender.com");
    socket.current.emit("joinBoard", boardId);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    socket.current.on("taskUpdated", (task) => {
      if (task.boardId !== boardId) return;
      setTasks((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].filter((t) => t._id !== task._id);
        });
        updated[task.status].unshift(task);
        return updated;
      });
    });

    socket.current.on("taskCreated", (task) => {
      if (task.boardId !== boardId) return;
      setTasks((prev) => ({
        ...prev,
        [task.status]: [task, ...prev[task.status]],
      }));
    });

    socket.current.on("tasksReordered", ({ column, tasks: reordered }) => {
      setTasks((prev) => ({
        ...prev,
        [column]: reordered,
      }));
    });

    socket.current.on("taskDeleted", ({ taskId }) => {
      setTasks((prev) => {
        const updated = { ...prev };
        for (let status in updated) {
          updated[status] = updated[status].filter((t) => t._id !== taskId);
        }
        return updated;
      });
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [boardId]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const updatedSource = [...tasks[sourceCol]];
    const draggedTask = updatedSource.splice(source.index, 1)[0];

    if (sourceCol === destCol) {
      updatedSource.splice(destination.index, 0, draggedTask);
      setTasks((prev) => ({ ...prev, [sourceCol]: updatedSource }));

      const reorderedPayload = updatedSource.map((t, index) => ({
        id: t._id,
        order: index,
      }));

      await API.post("/tasks/reorder", {
        boardId,
        column: sourceCol,
        tasks: reorderedPayload,
      });

      socket.current.emit("tasksReordered", {
        boardId,
        column: sourceCol,
        tasks: updatedSource,
      });
    } else {
      const updatedDest = [...tasks[destCol]];
      const movedTask = { ...draggedTask, status: destCol };
      updatedDest.splice(destination.index, 0, movedTask);

      setTasks((prev) => ({
        ...prev,
        [sourceCol]: updatedSource,
        [destCol]: updatedDest,
      }));

      await API.patch(`/tasks/${draggedTask._id}`, { status: destCol });

      socket.current.emit("taskUpdated", movedTask);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-white to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center mb-4 text-3xl font-extrabold text-indigo-700">
          User:{" "}
          <span className="text-indigo-900">{user.name || "Loading..."}</span>
        </h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-6 space-y-6 sm:space-y-0">
            {["Todo", "In Progress", "Done"].map((status) => (
              <Column
                key={status}
                title={status}
                tasks={tasks[status]}
                boardId={boardId}
                setTasks={setTasks}
                className="flex-1"
              />
            ))}
          </div>
        </DragDropContext>

        <div className="mt-10 flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          <div className="md:w-1/3 w-full">
            <InviteForm boardId={boardId} />
          </div>
          <div className="md:flex-1 w-full">
            <ActivityTimeline boardId={boardId} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;
