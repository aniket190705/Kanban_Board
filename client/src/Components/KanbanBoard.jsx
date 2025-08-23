import { useEffect, useState } from "react";
import Column from "../Components/Column";

const initialData = {
  Todo: [],
  "In Progress": [],
  Done: [],
};

function KanbanBoard() {
  const [tasks, setTasks] = useState(initialData);

  // Dummy fetch for now (replace with real API later)
  useEffect(() => {
    // Simulated task list
    const fetchedTasks = [
      { id: "1", title: "Design UI", status: "Todo", priority: "High" },
      {
        id: "2",
        title: "Build API",
        status: "In Progress",
        priority: "Medium",
      },
      { id: "3", title: "Write Docs", status: "Done", priority: "Low" },
    ];

    const grouped = {
      Todo: [],
      "In Progress": [],
      Done: [],
    };

    for (const task of fetchedTasks) {
      grouped[task.status].push(task);
    }

    setTasks(grouped);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:justify-around md:space-x-6 p-8 min-h-screen bg-gray-50">
      {["Todo", "In Progress", "Done"].map((status) => (
        <Column key={status} title={status} tasks={tasks[status]} />
      ))}
    </div>
  );
}

export default KanbanBoard;
