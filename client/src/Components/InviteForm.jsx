import { useState } from "react";
import API from "../services/api";

function InviteForm({ boardId }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleInvite = async () => {
    try {
      const res = await API.patch(`/boards/${boardId}/invite`, { email });
      setMessage(res.data.message);
      setEmail("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error inviting user");
    }
  };

  return (
    <div className="mt-8 h-35 max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
      <h4 className="text-base font-semibold mb-3 text-indigo-700">
        Invite a user to this board
      </h4>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          onClick={handleInvite}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          disabled={!email.trim()}
        >
          Invite
        </button>
      </div>
      {message && (
        <p className="mt-2 text-center text-green-600 font-medium select-text text-sm">
          {message}
        </p>
      )}
    </div>
  );
}

export default InviteForm;
