import { Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import API from "../services/api";

function TaskCard({ task, index, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority || "Medium",
  });

  const colors = {
    High: "tomato",
    Medium: "orange",
    Low: "green",
  };

  const priorityColors = {
    High: "border-red-500 text-red-600",
    Medium: "border-yellow-500 text-yellow-600",
    Low: "border-green-500 text-green-600",
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/tasks/${task._id}`);
      if (onDelete) onDelete(task._id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await API.patch(`/tasks/${task._id}`, formData);
      setIsEditing(false);
      // TODO: Replace with prop callback if needed
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 mb-4 rounded-lg shadow-md border-l-6 ${
            priorityColors[task.priority]
          } flex flex-col`}
          style={{ borderLeftWidth: "6px", ...provided.draggableProps.style }}
        >
          {isEditing ? (
            <>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  ❌ Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <strong className="text-black text-lg">{task.title}</strong>
              <p className="text-sm mt-1 mb-2">
                Priority:{" "}
                <span
                  className={`font-semibold ${
                    task.priority === "High"
                      ? "text-red-600"
                      : task.priority === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {task.priority}
                </span>
              </p>
              {task.description && (
                <p className="text-sm mb-3 text-gray-700">{task.description}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  ✏ Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:underline text-sm"
                >
                  🗑 Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default TaskCard;
