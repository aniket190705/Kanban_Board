// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      const res = await API.get("/boards");
      setBoards(res.data);
    };
    fetchBoards();
  }, [boards]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const res = await API.post("/boards", { title });
    setBoards((prev) => [...prev, res.data]);
    setTitle("");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000); // hide after 3 seconds
  };

  const handleDelete = async (boardId) => {
    try {
      await API.delete(`/boards/${boardId}`);
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
    } catch (err) {
      if (err.response && err.response.status === 403) {
        showToast("Only the creator can delete.");
      } else {
        showToast("Could not delete board!");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8
                    bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"
    >
      {toast && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          {toast}
        </div>
      )}

      {/* Content Wrapper */}
      <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        {/* Main Heading */}

        <h2 className="text-4xl flex justify-center font-semibold mb-6 text-blue-500 border-b-2 border-blue-600 pb-2">
          Your Boards
        </h2>

        {/* Create board input */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <input
            placeholder="Board name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 
                       outline-none w-64 bg-white"
          />
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white 
                       px-5 py-2 rounded-lg shadow-md font-medium
                       hover:from-indigo-700 hover:to-blue-600 
                       active:scale-95 transition transform duration-150"
          >
            + Create Board
          </button>
        </div>

        {/* Boards List */}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li
              key={board._id}
              onClick={() => navigate(`/board/${board._id}`)}
              className="relative p-6 bg-gradient-to-br from-white to-gray-50 
             shadow-lg rounded-xl cursor-pointer border border-gray-200 
             hover:shadow-xl hover:border-indigo-500 hover:bg-indigo-50 
             transition duration-200 group"
            >
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
                  <span className="font-medium text-gray-500">Name:</span>{" "}
                  {board.title}
                </p>
                <p className="text-sm text-gray-600 italic group-hover:text-indigo-600">
                  <span className="font-medium text-gray-500">Created by:</span>{" "}
                  {board.createdBy && board.createdBy.name
                    ? board.createdBy.name
                    : "Unknown"}
                </p>
              </div>
              {/* Delete Button */}
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 flex justify-center 
             px-3 py-1 bg-red-500 text-white text-xs rounded 
             hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card navigation!
                  handleDelete(board._id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
