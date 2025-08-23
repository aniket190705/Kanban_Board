import { useState, useEffect } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";

function AddTaskForm({ status, onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [boardId, setBoardId] = useState("");
  const { id } = useParams();

  useEffect(() => {
    if (!boardId) {
      setBoardId(id);
    }
  }, [boardId, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await API.post("/tasks", {
        title,
        description,
        priority,
        status,
        boardId,
      });

      if (onAdd) {
        onAdd(res.data);
      }
      setTitle("");
      setPriority("Medium");
      setDescription("");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md mt-4">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="High">🔥 High</option>
          <option value="Medium">⚖️ Medium</option>
          <option value="Low">🧊 Low</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}

export default AddTaskForm;
