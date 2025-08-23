import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import API from "../services/api";

function ActivityTimeline({ boardId }) {
  const [activities, setActivities] = useState([]);
  const socketRef = useRef(null);

  const fetchActivities = async () => {
    try {
      const res = await API.get(`/activity?boardId=${boardId}`);
      setActivities(res.data);
      console.log("Fetched activities:", res.data);
    } catch (err) {
      console.error("Failed to fetch activity log:", err);
    }
  };

  useEffect(() => {
    fetchActivities(); // Initial load

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("joinBoard", boardId);

    socketRef.current.on("activityLogged", (newActivity) => {
      setActivities((prev) => [newActivity, ...prev.slice(0, 19)]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [boardId]);

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
        <span role="img" aria-label="scroll">
          📜
        </span>{" "}
        Activity Timeline
      </h3>
      <ul className="list-none p-0 space-y-3 max-h-96 overflow-y-auto">
        {activities
          .filter((activity) => activity && activity.action)
          .map((activity) => (
            <li
              key={activity._id}
              className="border-l-4 border-indigo-500 pl-4 last:border-b-0 border-b border-gray-200 pb-2"
            >
              <p className="font-medium text-gray-800">{activity.action}</p>
              <p className="text-gray-600">{activity.details}</p>
              <small className="text-sm text-gray-500 block mt-1">
                By{" "}
                <span className="font-semibold text-indigo-600">
                  {activity.user?.name || "Unknown"}
                </span>{" "}
                at {new Date(activity.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        {activities.length === 0 && (
          <li className="text-center text-gray-400">No activity yet.</li>
        )}
      </ul>
    </div>
  );
}

export default ActivityTimeline;
